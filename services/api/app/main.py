from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import ActionCenterDecision, CreateCaseRequest, LoanCase
from app.store import store
from app.workflow import WorkflowError, complete_human_action, run_document_agent, run_step

app = FastAPI(title="FinFlow API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4174",
        "http://localhost:4174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"service": "finflow-api", "provider_mode": "MOCK", "status": "ok"}


@app.post("/cases", response_model=LoanCase, status_code=201)
def create_case(payload: CreateCaseRequest) -> LoanCase:
    return store.add_case(LoanCase(**payload.model_dump()))


@app.get("/cases", response_model=list[LoanCase])
def list_cases() -> list[LoanCase]:
    return store.list_cases()


@app.get("/cases/{case_id}", response_model=LoanCase)
def get_case(case_id: str) -> LoanCase:
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.get("/cases/{case_id}/events")
def get_events(case_id: str) -> list[dict]:
    if not store.get_case(case_id):
        raise HTTPException(status_code=404, detail="Case not found")
    return [event.model_dump() for event in store.list_events(case_id)]


@app.post("/cases/{case_id}/run/documents", response_model=LoanCase)
def run_documents(case_id: str) -> LoanCase:
    case = store.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return run_document_agent(case)


@app.post("/cases/{case_id}/run/{step}", response_model=LoanCase)
def run_workflow_step(case_id: str, step: str) -> LoanCase:
    try:
        return run_step(case_id, step)
    except WorkflowError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/webhooks/action-center", response_model=LoanCase)
def action_center(payload: ActionCenterDecision) -> LoanCase:
    try:
        return complete_human_action(payload)
    except WorkflowError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/webhooks/documind", response_model=LoanCase)
def documind_webhook(payload: dict) -> LoanCase:
    return run_documents(payload["case_id"])


@app.post("/webhooks/creditsage", response_model=LoanCase)
def creditsage_webhook(payload: dict) -> LoanCase:
    return run_workflow_step(payload["case_id"], "credit")


@app.post("/webhooks/complianceguard", response_model=LoanCase)
def complianceguard_webhook(payload: dict) -> LoanCase:
    return run_workflow_step(payload["case_id"], "compliance")


@app.post("/webhooks/decisionpilot", response_model=LoanCase)
def decisionpilot_webhook(payload: dict) -> LoanCase:
    return run_workflow_step(payload["case_id"], "decision")
