# AGENT_CONTRACTS.md — FinFlow Agent Contracts

> Owner: Claude Fable
> Every agent MUST produce outputs matching these schemas exactly.
> Pydantic validation is enforced at every agent boundary.

---

## Contract Rules

1. All agent inputs and outputs are Pydantic BaseModel subclasses
2. Agents receive input via UiPath Orchestrator Assets or HTTP POST to backend API
3. Agents publish results back to UiPath via webhook POST or Orchestrator queue
4. Every agent must complete within 120 seconds or raise a timeout exception
5. Every agent writes structured logs via `backend/utils/logger.py`
6. No agent stores secrets — all credentials via UiPath Orchestrator Assets

---

## Shared Enums (backend/models/case_models.py)

```python
from enum import Enum

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

class CaseStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    AWAITING_HUMAN = "awaiting_human"
    EXCEPTION = "exception"
    APPROVED = "approved"
    REJECTED = "rejected"
    REFERRED = "referred"
    CLOSED = "closed"

class AgentStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    EXCEPTION_RAISED = "exception_raised"
    AWAITING_INPUT = "awaiting_input"
```

---

## Agent: DocuMind

### Input (UiPath → DocuMind)

```python
class DocuMindInput(BaseModel):
    case_id: str                    # UUID of the LoanCase
    applicant_id: str               # Applicant identifier
    document_urls: List[str]        # Signed URLs to uploaded documents in OSS
    expected_doc_types: List[str]   # e.g. ["aadhaar", "pan", "salary_slip"]
    callback_url: str               # Backend webhook URL for result

    class Config:
        json_schema_extra = {
            "example": {
                "case_id": "550e8400-e29b-41d4-a716",
                "applicant_id": "APP-2026-00123",
                "document_urls": ["https://storage.../aadhaar.pdf"],
                "expected_doc_types": ["aadhaar", "pan", "salary_slip"],
                "callback_url": "https://api.finflow.in/webhooks/documind"
            }
        }
```

### Output (DocuMind → Backend)

```python
class ExtractedField(BaseModel):
    field_name: str
    value: str
    confidence: float               # 0.0 – 1.0
    page_number: int

class ExtractedDocument(BaseModel):
    document_url: str
    document_type: str              # "aadhaar" | "pan" | "salary_slip" | etc.
    extracted_fields: List[ExtractedField]
    validation_passed: bool
    missing_fields: List[str]       # Fields expected but not found

class DocuMindOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    documents: List[ExtractedDocument]
    all_docs_extracted: bool        # True if all expected docs extracted
    exception_type: Optional[str]   # "missing_document" | "low_confidence" | None
    exception_message: Optional[str]
    execution_ms: int
```

---

## Agent: CreditSage

### Input (UiPath → CreditSage via Backend API)

```python
class CreditSageInput(BaseModel):
    case_id: str
    applicant_id: str
    applicant_name: str
    pan_number: str
    date_of_birth: str              # ISO format: YYYY-MM-DD
    monthly_income: float
    loan_amount: float
    loan_type: LoanType
    loan_tenure_months: int
    extracted_documents: List[ExtractedDocument]
    callback_url: str
```

### Output (CreditSage → Backend)

```python
class BureauData(BaseModel):
    bureau_name: str                # "CIBIL" | "Experian" | "mock"
    credit_score: int               # 300 – 900
    active_loans: int
    total_outstanding: float
    dpd_30: int                     # Days past due 30 days count
    dpd_90: int

class CreditSageOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    bureau_data: Optional[BureauData]
    dti_ratio: float                # Debt-to-income ratio (0.0 – 1.0)
    income_stability_score: float   # Computed score (0.0 – 1.0)
    risk_score: float               # Final risk score (0.0 – 1.0)
    risk_band: str                  # "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
    llm_rationale: str              # LLM-generated narrative analysis
    recommendation: str             # "PROCEED" | "CAUTION" | "REJECT"
    exception_type: Optional[str]   # "bureau_api_failure" | "insufficient_data"
    exception_message: Optional[str]
    execution_ms: int
    model_used: str
```

---

## Agent: ComplianceGuard

### Input (UiPath → ComplianceGuard)

```python
class ComplianceGuardInput(BaseModel):
    case_id: str
    applicant_id: str
    applicant_name: str
    pan_number: str
    aadhaar_number: str             # Last 4 digits only for masking
    nationality: str
    loan_amount: float
    loan_type: LoanType
    credit_score_result: CreditSageOutput
    callback_url: str
```

### Output (ComplianceGuard → Backend)

```python
class ComplianceFlag(BaseModel):
    flag_type: str          # "AML_WATCHLIST" | "KYC_MISMATCH" | "RBI_LIMIT"
    severity: str           # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    description: str
    action_required: str

class ComplianceGuardOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    aml_cleared: bool
    kyc_verified: bool
    rbi_norms_met: bool
    compliance_passed: bool         # True only if all three above are True
    flags: List[ComplianceFlag]
    required_actions: List[str]     # Steps needed if not cleared
    exception_type: Optional[str]
    exception_message: Optional[str]
    execution_ms: int
```

---

## Agent: DecisionPilot

### Input (UiPath → DecisionPilot via Backend API)

```python
class DecisionPilotInput(BaseModel):
    case_id: str
    applicant_id: str
    loan_type: LoanType
    loan_amount: float
    loan_tenure_months: int
    extracted_documents: List[ExtractedDocument]
    credit_result: CreditSageOutput
    compliance_result: ComplianceGuardOutput
    bank_policy_version: str        # e.g. "v2.1" — loaded from Orchestrator Asset
    callback_url: str
```

### Output (DecisionPilot → Backend → Action Center)

```python
class LoanCondition(BaseModel):
    condition_type: str             # "GUARANTOR" | "COLLATERAL" | "REDUCED_AMOUNT"
    description: str
    mandatory: bool

class DecisionPilotOutput(BaseModel):
    case_id: str
    agent_status: AgentStatus
    recommendation: str             # "APPROVE" | "REJECT" | "REFER"
    confidence: float               # 0.0 – 1.0
    approved_amount: Optional[float]    # May differ from requested amount
    approved_tenure_months: Optional[int]
    interest_rate_band: Optional[str]   # e.g. "10.5% – 12.0%"
    conditions: List[LoanCondition]
    rejection_reasons: List[str]    # Populated if recommendation = REJECT
    executive_summary: str          # 2-3 sentence summary for human reviewer
    detailed_rationale: str         # Full LLM analysis (shown in Action Center)
    exception_type: Optional[str]
    exception_message: Optional[str]
    execution_ms: int
    model_used: str
```

---

## ExceptionHandler — Exception Types

```python
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
    AUTO_RESOLVABLE = "auto_resolvable"     # Handler retries automatically
    HUMAN_REQUIRED = "human_required"       # Action Center task created
    CRITICAL = "critical"                   # Case blocked, senior escalation

class ExceptionEvent(BaseModel):
    case_id: str
    exception_type: ExceptionType
    severity: ExceptionSeverity
    stage: CaseStage
    actor: str                      # Agent or robot that raised exception
    description: str
    raw_context: Dict               # Full context for debugging
    raised_at: datetime

class ResolutionResult(BaseModel):
    case_id: str
    exception_type: ExceptionType
    resolved: bool
    resolution_method: str          # "auto_retry" | "human_approved" | "escalated"
    resume_at_stage: Optional[CaseStage]
    human_task_id: Optional[str]    # Action Center task ID if escalated
    resolved_at: datetime
```

---

## Action Center Task Payloads

### Document Review Task

```python
class DocReviewTaskPayload(BaseModel):
    case_id: str
    applicant_name: str
    loan_type: LoanType
    loan_amount: float
    flagged_documents: List[Dict]   # [{"doc_type": str, "reason": str, "url": str}]
    extracted_summary: Dict         # Key fields extracted so far
    exception_description: str

class DocReviewDecision(BaseModel):
    task_id: str
    decision: str                   # "APPROVE_DOCS" | "REQUEST_RESUBMIT" | "ESCALATE"
    reviewer_notes: str
    reviewed_by: str
    reviewed_at: datetime
```

### Loan Decision Task

```python
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
    decision: str               # "APPROVE" | "REJECT" | "REFER_TO_CREDIT_COMMITTEE"
    approved_amount: Optional[float]
    officer_notes: str
    decided_by: str
    decided_at: datetime
```
