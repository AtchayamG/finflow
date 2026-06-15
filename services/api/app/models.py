from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


Stage = Literal[
    "intake",
    "document_review",
    "verification",
    "credit",
    "compliance",
    "decision",
    "exception",
    "closed",
]
Status = Literal[
    "open",
    "in_progress",
    "awaiting_human",
    "exception",
    "approved",
    "rejected",
    "referred",
    "closed",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class CreateCaseRequest(BaseModel):
    applicant_name: str = Field(min_length=2)
    loan_type: Literal["personal", "home", "business", "vehicle"]
    loan_amount: float = Field(gt=0)
    tenure_months: int = Field(ge=6, le=360)
    monthly_income: float = Field(gt=0)
    applicant_id: str | None = None
    pan_number: str = "SYNTHPAN1234"
    aadhaar_last4: str = "1234"
    nationality: str = "IN"
    existing_emi: float = 8000


class ActionCenterDecision(BaseModel):
    case_id: str
    task_type: Literal["document_review", "final_decision"]
    decision: str
    reviewer: str
    reason: str = Field(min_length=3)
    approved_amount: float | None = None


class CaseEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    case_id: str
    event_type: str
    stage: Stage
    actor: str
    message: str
    timestamp: str = Field(default_factory=utc_now)


class ExceptionRecord(BaseModel):
    case_id: str
    source_stage: Stage
    exception_type: str
    severity: Literal["AUTO_RESOLVABLE", "HUMAN_REQUIRED", "CRITICAL"]
    message: str
    timestamp: str = Field(default_factory=utc_now)
    retry_count: int = 0
    resolution_status: Literal["open", "resolved", "escalated"] = "open"
    resolved_by: str | None = None
    resolution_notes: str | None = None


class LoanCase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    applicant_id: str = Field(default_factory=lambda: f"APP-{uuid4().hex[:8].upper()}")
    applicant_name: str
    loan_type: str
    loan_amount: float
    tenure_months: int
    monthly_income: float
    pan_number: str = "SYNTHPAN1234"
    aadhaar_last4: str = "1234"
    nationality: str = "IN"
    current_stage: Stage = "intake"
    case_status: Status = "open"
    provider_mode: str = "MOCK"
    existing_emi: float = 8000
    proposed_emi: float = 16000
    bureau_score: int | None = None
    documents: list[dict] = Field(default_factory=list)
    credit: dict | None = None
    compliance: dict | None = None
    decision: dict | None = None
    action_tasks: list[dict] = Field(default_factory=list)
    exceptions: list[ExceptionRecord] = Field(default_factory=list)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


class AnalyticsSummary(BaseModel):
    total_cases: int
    in_progress: int
    awaiting_human: int
    exceptions: int
    approved: int
    rejected: int
    referred: int
    average_risk_score: float
    stage_counts: dict[str, int]
