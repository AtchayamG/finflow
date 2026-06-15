from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel


class LoanType(str, Enum):
    PERSONAL = "personal"
    HOME = "home"
    BUSINESS = "business"
    VEHICLE = "vehicle"

class CaseStage(str, Enum):
    INTAKE = "intake"
    VERIFICATION = "verification"
    CREDIT = "credit"
    COMPLIANCE = "compliance"
    DECISION = "decision"
    EXCEPTION = "exception"
    CLOSED = "closed"

class AgentStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    EXCEPTION_RAISED = "exception_raised"
    AWAITING_INPUT = "awaiting_input"

class ExtractedField(BaseModel):
    field_name: str
    value: str
    confidence: float
    page_number: int

class ExtractedDocument(BaseModel):
    document_url: str
    document_type: str
    extracted_fields: List[ExtractedField]
    validation_passed: bool
    missing_fields: List[str]

class DocuMindInput(BaseModel):
    case_id: str
    applicant_id: str
    document_urls: List[str]
    expected_doc_types: List[str]
    callback_url: str


class DocuMindOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    documents: List[ExtractedDocument]
    all_docs_extracted: bool
    exception_type: Optional[str]
    exception_message: Optional[str]
    execution_ms: int


class BureauData(BaseModel):
    bureau_name: str
    credit_score: int
    active_loans: int
    total_outstanding: float
    dpd_30: int
    dpd_90: int


class CreditSageInput(BaseModel):
    case_id: str
    applicant_id: str
    applicant_name: str
    pan_number: str
    date_of_birth: str
    monthly_income: float
    loan_amount: float
    loan_type: LoanType
    loan_tenure_months: int
    extracted_documents: List[ExtractedDocument]
    callback_url: str


class CreditSageOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    bureau_data: Optional[BureauData]
    dti_ratio: float
    income_stability_score: float
    risk_score: float
    risk_band: str
    llm_rationale: str
    recommendation: str
    exception_type: Optional[str]
    exception_message: Optional[str]
    execution_ms: int
    model_used: str


class ComplianceFlag(BaseModel):
    flag_type: str
    severity: str
    description: str
    action_required: str


class ComplianceGuardInput(BaseModel):
    case_id: str
    applicant_id: str
    applicant_name: str
    pan_number: str
    aadhaar_number: str
    nationality: str
    loan_amount: float
    loan_type: LoanType
    credit_score_result: CreditSageOutput
    callback_url: str


class ComplianceGuardOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    aml_cleared: bool
    kyc_verified: bool
    rbi_norms_met: bool
    compliance_passed: bool
    flags: List[ComplianceFlag]
    required_actions: List[str]
    exception_type: Optional[str]
    exception_message: Optional[str]
    execution_ms: int


class LoanCondition(BaseModel):
    condition_type: str
    description: str
    mandatory: bool


class DecisionPilotInput(BaseModel):
    case_id: str
    applicant_id: str
    loan_type: LoanType
    loan_amount: float
    loan_tenure_months: int
    extracted_documents: List[ExtractedDocument]
    credit_result: CreditSageOutput
    compliance_result: ComplianceGuardOutput
    bank_policy_version: str
    callback_url: str


class DecisionPilotOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    recommendation: str
    confidence: float
    approved_amount: Optional[float]
    approved_tenure_months: Optional[int]
    interest_rate_band: Optional[str]
    conditions: List[LoanCondition]
    rejection_reasons: List[str]
    executive_summary: str
    detailed_rationale: str
    exception_type: Optional[str]
    exception_message: Optional[str]
    execution_ms: int
    model_used: str


class ExceptionType(str, Enum):
    MISSING_DOCUMENT = "missing_document"
    LOW_CONFIDENCE_EXTRACTION = "low_confidence_extraction"
    BUREAU_API_FAILURE = "bureau_api_failure"
    WATCHLIST_MATCH = "watchlist_match"
    KYC_MISMATCH = "kyc_mismatch"
    AGENT_TIMEOUT = "agent_timeout"
    POLICY_BREACH = "policy_breach"
    DOCUMENT_FRAUD_SIGNAL = "document_fraud_signal"


class ExceptionSeverity(str, Enum):
    AUTO_RESOLVABLE = "auto_resolvable"
    HUMAN_REQUIRED = "human_required"
    CRITICAL = "critical"


class ExceptionEvent(BaseModel):
    case_id: str
    exception_type: ExceptionType
    severity: ExceptionSeverity
    stage: CaseStage
    actor: str
    description: str
    raw_context: Dict
    raised_at: datetime


class ResolutionResult(BaseModel):
    case_id: str
    exception_type: ExceptionType
    resolved: bool
    resolution_method: str
    resume_at_stage: Optional[CaseStage]
    human_task_id: Optional[str]
    resolved_at: datetime


class DocReviewTaskPayload(BaseModel):
    case_id: str
    applicant_name: str
    loan_type: LoanType
    loan_amount: float
    flagged_documents: List[Dict]
    extracted_summary: Dict
    exception_description: str


class DocReviewDecision(BaseModel):
    task_id: str
    decision: str
    reviewer_notes: str
    reviewed_by: str
    reviewed_at: datetime


class LoanDecisionTaskPayload(BaseModel):
    case_id: str
    applicant_name: str
    loan_type: LoanType
    loan_amount: float
    credit_score: int
    risk_band: str
    compliance_passed: bool
    compliance_flags: List[str]
    ai_recommendation: str
    ai_confidence: float
    executive_summary: str
    detailed_rationale: str
    proposed_conditions: List[str]


class LoanDecisionHuman(BaseModel):
    task_id: str
    decision: str
    approved_amount: Optional[float]
    officer_notes: str
    decided_by: str
    decided_at: datetime
