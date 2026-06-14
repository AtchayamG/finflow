from app.policy import compute_dti, evaluate_credit, evaluate_policy


def test_compute_dti_includes_existing_and_proposed_emi():
    assert compute_dti(monthly_income=65000, existing_emi=8000, proposed_emi=16000) == 0.3692


def test_credit_evaluation_is_deterministic_and_low_risk_for_demo_case():
    result = evaluate_credit(
        monthly_income=65000,
        existing_emi=8000,
        proposed_emi=16000,
        bureau_score=762,
    )

    assert result["dti"] == 0.3692
    assert result["risk_score"] < 0.35
    assert result["risk_band"] == "LOW"


def test_policy_failure_controls_recommendation_options():
    result = evaluate_policy(
        loan_type="personal",
        loan_amount=3500000,
        monthly_income=65000,
        dti=0.37,
        bureau_score=762,
        compliance_passed=True,
    )

    assert result["passed"] is False
    assert "loan_amount_exceeds_policy_limit" in result["violations"]
