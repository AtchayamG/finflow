from fastapi.testclient import TestClient

from app.main import app
from app.settings import get_settings


client = TestClient(app)


def _create_case(name: str, amount: float, income: float, loan_type: str = "personal") -> str:
    response = client.post(
        "/cases",
        json={
            "applicant_name": name,
            "loan_type": loan_type,
            "loan_amount": amount,
            "tenure_months": 36,
            "monthly_income": income,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def _run_to_decision(case_id: str) -> dict:
    assert client.post(f"/cases/{case_id}/run/documents").status_code == 200
    assert client.post(
        "/webhooks/action-center",
        json={
            "case_id": case_id,
            "task_type": "document_review",
            "decision": "APPROVE_DOCS",
            "reviewer": "demo.officer",
            "reason": "Synthetic masked field approved.",
        },
    ).status_code == 200
    for step in ["verification", "credit", "compliance", "decision"]:
        response = client.post(f"/cases/{case_id}/run/{step}")
        assert response.status_code == 200
    return client.get(f"/cases/{case_id}").json()


def test_health_reports_service_and_mode():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["service"] == "finflow-api"
    assert response.json()["provider_mode"] == "MOCK"


def test_case_can_progress_through_exception_and_approval():
    case_id = _create_case("Priya Sharma", 500000, 125000)
    before_final = _run_to_decision(case_id)

    assert before_final["current_stage"] == "decision"
    assert before_final["decision"]["recommendation"] == "APPROVE"
    assert before_final["credit"]["risk_band"] == "LOW"
    assert before_final["compliance"]["passed"] is True

    final = client.post(
        "/webhooks/action-center",
        json={
            "case_id": case_id,
            "task_type": "final_decision",
            "decision": "approve",
            "reviewer": "demo.officer",
            "reason": "Policy passed and affordability is within threshold.",
        },
    )
    assert final.status_code == 200
    assert final.json()["case_status"] == "approved"
    assert final.json()["current_stage"] == "closed"


def test_refer_path_for_medium_risk_policy_exception():
    case_id = _create_case("Ravi Medium", 1900000, 70000)
    result = _run_to_decision(case_id)

    assert result["decision"]["recommendation"] == "REFER"
    assert result["case_status"] == "awaiting_human"


def test_reject_path_for_watchlist_compliance_flag():
    case_id = _create_case("Watch Listed", 3000000, 45000)
    result = _run_to_decision(case_id)

    assert result["decision"]["recommendation"] == "REJECT"
    assert result["compliance"]["passed"] is False
    assert result["exceptions"]


def test_exceptions_and_analytics_endpoints_reflect_case_state():
    case_id = _create_case("Analytics User", 400000, 100000)
    assert client.post(f"/cases/{case_id}/run/documents").status_code == 200

    exceptions = client.get("/exceptions")
    analytics = client.get("/analytics/summary")

    assert exceptions.status_code == 200
    assert any(item["case_id"] == case_id for item in exceptions.json())
    assert analytics.status_code == 200
    assert analytics.json()["total_cases"] >= 1


def test_webhook_auth_401_when_mock_bypass_disabled(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "mock_bypass_webhook_auth", False)
    monkeypatch.setattr(settings, "webhook_token", "test-token")
    response = client.post("/webhooks/documind", json={"case_id": "missing"})

    assert response.status_code == 401

    monkeypatch.setattr(settings, "mock_bypass_webhook_auth", True)
