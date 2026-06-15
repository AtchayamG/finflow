from time import perf_counter

from app.contracts import AgentStatus, DecisionPilotInput, DecisionPilotOutput, LoanCondition
from app.logging_utils import log_event
from app.policy import evaluate_policy


def run_decisionpilot(payload: DecisionPilotInput) -> DecisionPilotOutput:
    started = perf_counter()
    bureau_score = payload.credit_result.bureau_data.credit_score if payload.credit_result.bureau_data else 300
    policy = evaluate_policy(
        payload.loan_type.value,
        payload.loan_amount,
        _income_proxy(payload),
        payload.credit_result.dti_ratio,
        bureau_score,
        payload.compliance_result.compliance_passed,
    )
    recommendation = _recommendation(policy["passed"], payload.credit_result.risk_band, payload.compliance_result)
    conditions = _conditions(recommendation, payload.credit_result.risk_band)
    approved_amount = payload.loan_amount if recommendation == "APPROVE" else None
    if recommendation == "REFER":
        approved_amount = round(payload.loan_amount * 0.82, 2)

    output = DecisionPilotOutput(
        case_id=payload.case_id,
        agent_status=AgentStatus.SUCCESS,
        recommendation=recommendation,
        confidence=_confidence(recommendation, payload.credit_result.risk_score, policy["violations"]),
        approved_amount=approved_amount,
        approved_tenure_months=payload.loan_tenure_months if recommendation != "REJECT" else None,
        interest_rate_band="10.5% - 12.0%" if recommendation != "REJECT" else None,
        conditions=conditions,
        rejection_reasons=policy["violations"] if recommendation == "REJECT" else [],
        executive_summary=_summary(recommendation, payload.credit_result.risk_band, policy["violations"]),
        detailed_rationale=_details(payload, policy["violations"]),
        exception_type=None,
        exception_message=None,
        execution_ms=int((perf_counter() - started) * 1000),
        model_used="deterministic-policy-v1",
    )
    log_event("agent.decisionpilot.completed", case_id=payload.case_id, recommendation=recommendation)
    return output


def _income_proxy(payload: DecisionPilotInput) -> float:
    monthly_exposure = payload.loan_amount / max(payload.loan_tenure_months, 1)
    return max(monthly_exposure * 5, 50000)


def _recommendation(passed: bool, risk_band: str, compliance) -> str:
    if not compliance.compliance_passed or risk_band == "VERY_HIGH":
        return "REJECT"
    if passed and risk_band == "LOW":
        return "APPROVE"
    return "REFER"


def _conditions(recommendation: str, risk_band: str) -> list[LoanCondition]:
    if recommendation == "APPROVE":
        return []
    if recommendation == "REJECT":
        return [LoanCondition(condition_type="POLICY_REVIEW", description="Policy breach prevents approval.", mandatory=True)]
    return [
        LoanCondition(condition_type="REDUCED_AMOUNT", description="Approve at reduced exposure pending officer review.", mandatory=True),
        LoanCondition(condition_type="GUARANTOR", description="Add guarantor for medium-risk affordability.", mandatory=False),
    ]


def _confidence(recommendation: str, risk_score: float, violations: list[str]) -> float:
    base = {"APPROVE": 0.88, "REFER": 0.73, "REJECT": 0.82}[recommendation]
    return round(max(0.55, min(0.96, base - len(violations) * 0.04 + (0.3 - risk_score) * 0.08)), 2)


def _summary(recommendation: str, risk_band: str, violations: list[str]) -> str:
    if recommendation == "APPROVE":
        return f"Recommendation is APPROVE with {risk_band} risk and no blocking policy violations."
    if recommendation == "REJECT":
        return f"Recommendation is REJECT due to blocking policy/compliance issues: {', '.join(violations)}."
    return f"Recommendation is REFER because risk is {risk_band} or policy exceptions need human judgement."


def _details(payload: DecisionPilotInput, violations: list[str]) -> str:
    flags = [flag.flag_type for flag in payload.compliance_result.flags]
    return (
        "DecisionPilot used deterministic policy checks and mock provider results. "
        f"Policy violations: {violations or ['none']}. Compliance flags: {flags or ['none']}."
    )
