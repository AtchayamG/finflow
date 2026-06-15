from time import perf_counter

from app.contracts import AgentStatus, BureauData, CreditSageInput, CreditSageOutput
from app.logging_utils import log_event
from app.policy import compute_dti


def run_creditsage(payload: CreditSageInput) -> CreditSageOutput:
    started = perf_counter()
    proposed_emi = max(payload.loan_amount / max(payload.loan_tenure_months, 1) * 0.035, 2500)
    existing_emi = _estimated_existing_emi(payload)
    dti = compute_dti(payload.monthly_income, existing_emi, proposed_emi)
    bureau = _mock_bureau(payload, dti)
    income_stability = _income_stability(payload.monthly_income, payload.loan_type.value)
    bureau_risk = 1.0 - ((bureau.credit_score - 300) / 600)
    risk_score = round((bureau_risk * 0.52) + (dti * 0.33) + ((1 - income_stability) * 0.15), 4)
    risk_band = _risk_band(risk_score)
    recommendation = "PROCEED" if risk_band == "LOW" else "CAUTION"
    if risk_band in {"HIGH", "VERY_HIGH"} or bureau.dpd_90 > 0:
        recommendation = "REJECT"

    output = CreditSageOutput(
        case_id=payload.case_id,
        agent_status=AgentStatus.SUCCESS,
        bureau_data=bureau,
        dti_ratio=dti,
        income_stability_score=income_stability,
        risk_score=risk_score,
        risk_band=risk_band,
        llm_rationale=_rationale(payload.applicant_name, bureau.credit_score, dti, risk_band),
        recommendation=recommendation,
        exception_type=None,
        exception_message=None,
        execution_ms=int((perf_counter() - started) * 1000),
        model_used="deterministic-mock-v1",
    )
    log_event("agent.creditsage.completed", case_id=payload.case_id, risk_band=risk_band)
    return output


def _estimated_existing_emi(payload: CreditSageInput) -> float:
    pressure = payload.loan_amount / max(payload.monthly_income, 1)
    return round(min(payload.monthly_income * 0.38, max(4000, pressure * 1500)), 2)


def _mock_bureau(payload: CreditSageInput, dti: float) -> BureauData:
    name_bias = sum(ord(char) for char in payload.applicant_name.lower()) % 70
    affordability_penalty = int(max(payload.loan_amount / max(payload.monthly_income, 1) - 8, 0) * 7)
    dti_penalty = int(max(dti - 0.35, 0) * 260)
    score = max(300, min(900, 785 + name_bias - affordability_penalty - dti_penalty))
    active_loans = 1 + int(dti > 0.38) + int(payload.loan_amount > 1_500_000)
    return BureauData(
        bureau_name="mock",
        credit_score=score,
        active_loans=active_loans,
        total_outstanding=round(payload.loan_amount * (0.08 + active_loans * 0.04), 2),
        dpd_30=1 if score < 690 else 0,
        dpd_90=1 if score < 620 else 0,
    )


def _income_stability(monthly_income: float, loan_type: str) -> float:
    baseline = {"personal": 0.78, "home": 0.82, "business": 0.68, "vehicle": 0.74}[loan_type]
    income_boost = min(monthly_income / 200000, 0.16)
    return round(min(0.98, baseline + income_boost), 3)


def _risk_band(risk_score: float) -> str:
    if risk_score < 0.32:
        return "LOW"
    if risk_score < 0.52:
        return "MEDIUM"
    if risk_score < 0.72:
        return "HIGH"
    return "VERY_HIGH"


def _rationale(name: str, score: int, dti: float, risk_band: str) -> str:
    return (
        f"{name} has mock bureau score {score} with DTI {dti:.2%}. "
        f"The deterministic scoring model places the case in {risk_band} risk."
    )
