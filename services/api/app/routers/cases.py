from fastapi import APIRouter, HTTPException

from app.models import CreateCaseRequest, LoanCase
from app.store import store
from app.workflow import WorkflowError, run_document_agent, run_step

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post("", response_model=LoanCase, status_code=201)
def create_case(payload: CreateCaseRequest) -> LoanCase:
    data = payload.model_dump()
    if not data.get("applicant_id"):
        data.pop("applicant_id", None)
    case = LoanCase(**data)
    case.proposed_emi = round(max(case.loan_amount / case.tenure_months * 0.035, 2500), 2)
    return store.add_case(case)


@router.get("", response_model=list[LoanCase])
def list_cases() -> list[LoanCase]:
    return store.list_cases()


@router.get("/{case_id}", response_model=LoanCase)
def get_case(case_id: str) -> LoanCase:
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.get("/{case_id}/events")
def get_events(case_id: str) -> list[dict]:
    if not store.get_case(case_id):
        raise HTTPException(status_code=404, detail="Case not found")
    return [event.model_dump() for event in store.list_events(case_id)]


@router.post("/{case_id}/run/documents", response_model=LoanCase)
def run_documents(case_id: str) -> LoanCase:
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return run_document_agent(case)


@router.post("/{case_id}/run/{step}", response_model=LoanCase)
def run_workflow_step(case_id: str, step: str) -> LoanCase:
    try:
        return run_step(case_id, step)
    except WorkflowError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
