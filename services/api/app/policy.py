def compute_dti(monthly_income: float, existing_emi: float, proposed_emi: float) -> float:
    if monthly_income <= 0:
        return 1.0
    return round(min((existing_emi + proposed_emi) / monthly_income, 1.0), 4)


def evaluate_credit(
    monthly_income: float,
    existing_emi: float,
    proposed_emi: float,
    bureau_score: int,
) -> dict:
    dti = compute_dti(monthly_income, existing_emi, proposed_emi)
    bureau_risk = 1.0 - ((max(min(bureau_score, 900), 300) - 300) / 600)
    risk_score = round((bureau_risk * 0.6) + (dti * 0.4), 4)
    if risk_score < 0.35:
        band = "LOW"
    elif risk_score < 0.55:
        band = "MEDIUM"
    else:
        band = "HIGH"
    return {
        "bureau_score": bureau_score,
        "dti": dti,
        "risk_score": risk_score,
        "risk_band": band,
    }


def evaluate_policy(
    loan_type: str,
    loan_amount: float,
    monthly_income: float,
    dti: float,
    bureau_score: int,
    compliance_passed: bool,
) -> dict:
    rules = {
        "personal": {"max_amount": 2_000_000, "min_income": 25_000, "max_dti": 0.45, "min_bureau": 700},
        "home": {"max_amount": 50_000_000, "min_income": 40_000, "max_dti": 0.40, "min_bureau": 720},
        "business": {"max_amount": 10_000_000, "min_income": 50_000, "max_dti": 0.50, "min_bureau": 700},
        "vehicle": {"max_amount": 5_000_000, "min_income": 30_000, "max_dti": 0.45, "min_bureau": 690},
    }[loan_type]
    violations: list[str] = []
    if loan_amount > rules["max_amount"]:
        violations.append("loan_amount_exceeds_policy_limit")
    if monthly_income < rules["min_income"]:
        violations.append("income_below_policy_minimum")
    if dti > rules["max_dti"]:
        violations.append("dti_exceeds_policy_limit")
    if bureau_score < rules["min_bureau"]:
        violations.append("bureau_score_below_policy_minimum")
    if not compliance_passed:
        violations.append("compliance_not_cleared")
    return {
        "passed": not violations,
        "violations": violations,
        "policy_version": "demo-policy-2026-06",
    }
