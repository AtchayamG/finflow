from fastapi import APIRouter, HTTPException

from app.models import ActionCenterDecision, LoanCase
from app.routers.cases import run_documents, run_workflow_step
from app.workflow import WorkflowError, complete_human_action

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/action-center", response_model=LoanCase)
def action_center(payload: ActionCenterDecision) -> LoanCase:
    try:
        return complete_human_action(payload)
    except WorkflowError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/documind", response_model=LoanCase)
def documind_webhook(payload: dict) -> LoanCase:
    return run_documents(payload["case_id"])


@router.post("/creditsage", response_model=LoanCase)
def creditsage_webhook(payload: dict) -> LoanCase:
    return run_workflow_step(payload["case_id"], "credit")


@router.post("/complianceguard", response_model=LoanCase)
def complianceguard_webhook(payload: dict) -> LoanCase:
    return run_workflow_step(payload["case_id"], "compliance")


@router.post("/decisionpilot", response_model=LoanCase)
def decisionpilot_webhook(payload: dict) -> LoanCase:
    return run_workflow_step(payload["case_id"], "decision")
