import asyncio
from datetime import datetime, timezone

from app.agents import classify_exception, run_complianceguard, run_creditsage, run_decisionpilot, run_documind
from app.contracts import (
    ComplianceGuardInput,
    ComplianceGuardOutput,
    CreditSageInput,
    CreditSageOutput,
    DecisionPilotInput,
    DocuMindInput,
    ExtractedDocument,
    LoanType,
)
from app.errors import WorkflowError
from app.models import ActionCenterDecision, ExceptionRecord, LoanCase, utc_now
from app.services.uipath_client import uipath_client
from app.store import store


def run_document_agent(case: LoanCase) -> LoanCase:
    payload = DocuMindInput(
        case_id=case.id,
        applicant_id=case.applicant_id,
        document_urls=[],
        expected_doc_types=["aadhaar", "pan", "salary_slip"],
        callback_url="/webhooks/documind",
    )
    output = run_documind(payload)
    case.documents = [doc.model_dump() for doc in output.documents]
    if output.exception_type:
        _raise_exception(case, "document_review", output.exception_type, output.exception_message or "Document exception")
        task = _await(_create_task("document_review", _doc_review_payload(case, output.exception_message or "")))
        case.action_tasks.append(task)
        case.current_stage = "document_review"
        case.case_status = "awaiting_human"
    else:
        case.current_stage = "verification"
        case.case_status = "in_progress"
    case.updated_at = utc_now()
    store.add_event(case.id, "documents_extracted", case.current_stage, "DocuMind", output.exception_message or "Synthetic documents extracted")
    return store.save_case(case)


def complete_human_action(payload: ActionCenterDecision) -> LoanCase:
    case = _case(payload.case_id)
    if payload.task_type == "document_review":
        return _complete_document_review(case, payload)
    if payload.task_type == "final_decision":
        return _complete_final_decision(case, payload)
    raise WorkflowError("Unsupported task type")


def run_step(case_id: str, step: str) -> LoanCase:
    case = _case(case_id)
    handlers = {
        "verification": _run_verification,
        "credit": _run_credit,
        "compliance": _run_compliance,
        "decision": _run_decision,
    }
    if step not in handlers:
        raise WorkflowError(f"Unsupported workflow step: {step}")
    return handlers[step](case)


def _complete_document_review(case: LoanCase, payload: ActionCenterDecision) -> LoanCase:
    decision = payload.decision.lower()
    if decision in {"approve_documents", "approve_docs"}:
        for item in case.exceptions:
            if item.resolution_status == "open":
                item.resolution_status = "resolved"
                item.resolved_by = payload.reviewer
                item.resolution_notes = payload.reason
        case.current_stage = "verification"
        case.case_status = "in_progress"
        event_type = "human_document_review_completed"
    elif decision in {"escalate", "escalated"}:
        for item in case.exceptions:
            if item.resolution_status == "open":
                item.resolution_status = "escalated"
                item.resolved_by = payload.reviewer
                item.resolution_notes = payload.reason
        case.current_stage = "exception"
        case.case_status = "exception"
        event_type = "human_document_review_escalated"
    else:
        case.current_stage = "document_review"
        case.case_status = "awaiting_human"
        event_type = "human_document_resubmission_requested"
    case.updated_at = utc_now()
    store.add_event(case.id, event_type, case.current_stage, payload.reviewer, payload.reason)
    return store.save_case(case)


def _complete_final_decision(case: LoanCase, payload: ActionCenterDecision) -> LoanCase:
    if case.current_stage != "decision":
        raise WorkflowError("Final decision is available only at decision stage")
    case.current_stage = "closed"
    decision = payload.decision.lower()
    case.case_status = {"approve": "approved", "reject": "rejected"}.get(decision, "referred")
    if case.decision:
        case.decision["human_decision"] = payload.model_dump()
    case.updated_at = utc_now()
    store.add_event(case.id, "final_human_decision_recorded", "closed", payload.reviewer, payload.reason)
    return store.save_case(case)


def _run_verification(case: LoanCase) -> LoanCase:
    case.current_stage = "credit"
    case.case_status = "in_progress"
    case.updated_at = utc_now()
    _await(uipath_client.update_case_attribute(case.id, {"stage": "credit"}))
    store.add_event(case.id, "documents_verified", "credit", "DocValidatorRPA", "Synthetic documents verified")
    return store.save_case(case)


def _run_credit(case: LoanCase) -> LoanCase:
    output = run_creditsage(
        CreditSageInput(
            case_id=case.id,
            applicant_id=case.applicant_id,
            applicant_name=case.applicant_name,
            pan_number=case.pan_number,
            date_of_birth="1990-01-01",
            monthly_income=case.monthly_income,
            loan_amount=case.loan_amount,
            loan_type=LoanType(case.loan_type),
            loan_tenure_months=case.tenure_months,
            extracted_documents=_documents(case),
            callback_url="/webhooks/creditsage",
        )
    )
    case.bureau_score = output.bureau_data.credit_score if output.bureau_data else None
    case.credit = output.model_dump()
    case.credit.update({"bureau_score": case.bureau_score, "dti": output.dti_ratio})
    case.current_stage = "compliance"
    case.updated_at = utc_now()
    store.add_event(case.id, "credit_completed", "compliance", "CreditSage", output.recommendation)
    return store.save_case(case)


def _run_compliance(case: LoanCase) -> LoanCase:
    credit = CreditSageOutput.model_validate(case.credit or {})
    output = run_complianceguard(
        ComplianceGuardInput(
            case_id=case.id,
            applicant_id=case.applicant_id,
            applicant_name=case.applicant_name,
            pan_number=case.pan_number,
            aadhaar_number=case.aadhaar_last4,
            nationality=case.nationality,
            loan_amount=case.loan_amount,
            loan_type=LoanType(case.loan_type),
            credit_score_result=credit,
            callback_url="/webhooks/complianceguard",
        )
    )
    case.compliance = output.model_dump()
    case.compliance.update({"passed": output.compliance_passed, "flags": [flag.model_dump() for flag in output.flags]})
    if output.exception_type:
        _raise_exception(case, "compliance", output.exception_type, output.exception_message or "Compliance exception")
    case.current_stage = "decision"
    case.updated_at = utc_now()
    store.add_event(case.id, "compliance_completed", "decision", "ComplianceGuard", output.exception_message or "Mock checks completed")
    return store.save_case(case)


def _run_decision(case: LoanCase) -> LoanCase:
    if not case.credit or not case.compliance:
        raise WorkflowError("Credit and compliance must complete before decision")
    output = run_decisionpilot(
        DecisionPilotInput(
            case_id=case.id,
            applicant_id=case.applicant_id,
            loan_type=LoanType(case.loan_type),
            loan_amount=case.loan_amount,
            loan_tenure_months=case.tenure_months,
            extracted_documents=_documents(case),
            credit_result=CreditSageOutput.model_validate(case.credit),
            compliance_result=ComplianceGuardOutput.model_validate(case.compliance),
            bank_policy_version="demo-policy-2026-06",
            callback_url="/webhooks/decisionpilot",
        )
    )
    case.decision = output.model_dump()
    case.current_stage = "decision"
    case.case_status = "awaiting_human"
    task = _await(_create_task("final_decision", _decision_payload(case)))
    case.action_tasks.append(task)
    case.updated_at = utc_now()
    store.add_event(case.id, "decision_recommendation_generated", "decision", "DecisionPilot", output.recommendation)
    return store.save_case(case)


def _documents(case: LoanCase) -> list[ExtractedDocument]:
    return [ExtractedDocument.model_validate(doc) for doc in case.documents]


async def _create_task(task_type: str, payload: dict) -> dict:
    return await uipath_client.create_action_center_task(task_type, payload)


def _await(coro):
    return asyncio.run(coro)


def _raise_exception(case: LoanCase, stage: str, exception_type: str, message: str) -> None:
    severity = classify_exception(exception_type).name
    case.exceptions.append(
        ExceptionRecord(case_id=case.id, source_stage=stage, exception_type=exception_type, severity=severity, message=message)
    )


def _doc_review_payload(case: LoanCase, description: str) -> dict:
    return {
        "case_id": case.id,
        "applicant_name": case.applicant_name,
        "loan_type": case.loan_type,
        "loan_amount": case.loan_amount,
        "flagged_documents": [{"doc_type": "aadhaar", "reason": description, "url": "synthetic://masked-id"}],
        "extracted_summary": {"documents": len(case.documents), "mode": "synthetic"},
        "exception_description": description,
    }


def _decision_payload(case: LoanCase) -> dict:
    flags = [flag.get("flag_type", "UNKNOWN") for flag in (case.compliance or {}).get("flags", [])]
    return {
        "case_id": case.id,
        "applicant_name": case.applicant_name,
        "loan_type": case.loan_type,
        "loan_amount": case.loan_amount,
        "credit_score": case.bureau_score or 0,
        "risk_band": (case.credit or {}).get("risk_band", "UNKNOWN"),
        "compliance_passed": (case.compliance or {}).get("passed", False),
        "compliance_flags": flags,
        "ai_recommendation": (case.decision or {}).get("recommendation", "PENDING"),
        "ai_confidence": (case.decision or {}).get("confidence", 0),
        "executive_summary": (case.decision or {}).get("executive_summary", ""),
        "detailed_rationale": (case.decision or {}).get("detailed_rationale", ""),
        "proposed_conditions": [item["description"] for item in (case.decision or {}).get("conditions", [])],
    }


def _case(case_id: str) -> LoanCase:
    case = store.get_case(case_id)
    if not case:
        raise WorkflowError("Case not found")
    return case
