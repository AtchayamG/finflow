from app.models import ActionCenterDecision, ExceptionRecord, LoanCase, utc_now
from app.policy import evaluate_credit, evaluate_policy
from app.store import store


class WorkflowError(ValueError):
    pass


def run_document_agent(case: LoanCase) -> LoanCase:
    case.current_stage = "document_review"
    case.case_status = "exception"
    exception = ExceptionRecord(
        case_id=case.id,
        source_stage="intake",
        exception_type="low_confidence_extraction",
        severity="HUMAN_REQUIRED",
        message="Masked ID field needs human confirmation in demo document set.",
    )
    case.exceptions.append(exception)
    case.updated_at = utc_now()
    store.add_event(case.id, "document_exception_raised", case.current_stage, "DocuMind", exception.message)
    return case


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
    if payload.decision != "approve_documents":
        case.case_status = "exception"
        store.add_event(case.id, "human_document_review_blocked", case.current_stage, payload.reviewer, payload.reason)
        return case
    for item in case.exceptions:
        if item.resolution_status == "open":
            item.resolution_status = "resolved"
            item.resolved_by = payload.reviewer
            item.resolution_notes = payload.reason
    case.current_stage = "verification"
    case.case_status = "in_progress"
    case.updated_at = utc_now()
    store.add_event(case.id, "human_document_review_completed", "verification", payload.reviewer, payload.reason)
    return case


def _complete_final_decision(case: LoanCase, payload: ActionCenterDecision) -> LoanCase:
    if case.current_stage != "decision":
        raise WorkflowError("Final decision is available only at decision stage")
    case.current_stage = "closed"
    case.case_status = {"approve": "approved", "reject": "rejected"}.get(payload.decision, "referred")
    case.updated_at = utc_now()
    store.add_event(case.id, "final_human_decision_recorded", "closed", payload.reviewer, payload.reason)
    return case


def _run_verification(case: LoanCase) -> LoanCase:
    case.current_stage = "credit"
    case.case_status = "in_progress"
    case.updated_at = utc_now()
    store.add_event(case.id, "documents_verified", "credit", "DocValidatorRPA", "Synthetic documents verified")
    return case


def _run_credit(case: LoanCase) -> LoanCase:
    case.bureau_score = 762
    case.credit = evaluate_credit(case.monthly_income, case.existing_emi, case.proposed_emi, case.bureau_score)
    case.current_stage = "compliance"
    case.updated_at = utc_now()
    store.add_event(case.id, "credit_completed", "compliance", "CreditSage", "Mock bureau and DTI scoring completed")
    return case


def _run_compliance(case: LoanCase) -> LoanCase:
    case.compliance = {"passed": True, "flags": [], "provider_mode": "MOCK"}
    case.current_stage = "decision"
    case.updated_at = utc_now()
    store.add_event(case.id, "compliance_completed", "decision", "ComplianceGuard", "Mock KYC and AML checks cleared")
    return case


def _run_decision(case: LoanCase) -> LoanCase:
    if not case.credit or not case.compliance:
        raise WorkflowError("Credit and compliance must complete before decision")
    policy = evaluate_policy(
        case.loan_type,
        case.loan_amount,
        case.monthly_income,
        case.credit["dti"],
        case.credit["bureau_score"],
        case.compliance["passed"],
    )
    recommendation = "APPROVE" if policy["passed"] and case.credit["risk_band"] == "LOW" else "REFER"
    case.decision = {
        "recommendation": recommendation,
        "confidence": 0.87,
        "policy": policy,
        "rationale": "Deterministic policy checks passed; AI narrative is explanation-only.",
    }
    case.current_stage = "decision"
    case.updated_at = utc_now()
    store.add_event(case.id, "decision_recommendation_generated", "decision", "DecisionPilot", recommendation)
    return case


def _case(case_id: str) -> LoanCase:
    case = store.get_case(case_id)
    if not case:
        raise WorkflowError("Case not found")
    return case
