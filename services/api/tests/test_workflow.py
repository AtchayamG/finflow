from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_reports_service_and_mode():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["service"] == "finflow-api"
    assert response.json()["provider_mode"] == "MOCK"


def test_case_can_progress_through_exception_and_human_decision():
    created = client.post(
        "/cases",
        json={
            "applicant_name": "Priya Sharma",
            "loan_type": "personal",
            "loan_amount": 500000,
            "tenure_months": 36,
            "monthly_income": 65000,
        },
    )

    assert created.status_code == 201
    case_id = created.json()["id"]
    assert created.json()["current_stage"] == "intake"

    doc_result = client.post(f"/cases/{case_id}/run/documents")
    assert doc_result.status_code == 200
    assert doc_result.json()["current_stage"] == "document_review"
    assert doc_result.json()["case_status"] == "exception"

    review = client.post(
        "/webhooks/action-center",
        json={
            "case_id": case_id,
            "task_type": "document_review",
            "decision": "approve_documents",
            "reviewer": "demo.officer",
            "reason": "Synthetic demo documents accepted after masked field review.",
        },
    )
    assert review.status_code == 200
    assert review.json()["current_stage"] == "verification"

    for step in ["verification", "credit", "compliance", "decision"]:
        response = client.post(f"/cases/{case_id}/run/{step}")
        assert response.status_code == 200

    before_final = client.get(f"/cases/{case_id}").json()
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

    events = client.get(f"/cases/{case_id}/events")
    event_types = [event["event_type"] for event in events.json()]
    assert "document_exception_raised" in event_types
    assert "human_document_review_completed" in event_types
    assert "final_human_decision_recorded" in event_types
