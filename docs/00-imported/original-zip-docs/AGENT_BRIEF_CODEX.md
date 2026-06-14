# AGENT_BRIEF_CODEX.md — Briefing for Codex

> You are Codex. Read this entire document before writing any code.
> Owner/Reviewer: Claude Fable. All output reviewed before merge to main.
> Deadline: June 29, 2026.

---

## Your Identity in This Project

You are the **backend infrastructure and automation engineer** for FinFlow.
You own: data models, database layer, utilities, UiPath Maestro Case config,
the Document Verification RPA robot, ExceptionHandler automation, FastAPI
backend, and all infrastructure files.

---

## Your Phases

Phases 1, 2, 4, 8, 10, 11 — see TASK_LIST.md for detailed task IDs.

---

## Non-Negotiable Rules

1. **Every file ≤ 250 lines.** Split at logical module boundaries.
2. **No hardcoded secrets.** Use `os.getenv()` or pydantic-settings only.
3. **All async functions must have timeout handling.**
   Use `asyncio.wait_for(coro, timeout=30.0)` for external calls.
4. **All external API calls (bureau, Aadhaar, AML) have mock modes.**
   When `BUREAU_API_MOCK=true`, return realistic mock data — never call real APIs.
5. **All agent inputs/outputs use Pydantic models from AGENT_CONTRACTS.md.**
6. **Write the test file alongside every module.**
7. **UiPath XAML workflows must be clean — no unused activities.**

---

## Environment Variables You Configure

See `ENVIRONMENT_SETUP.md` for full `.env.example`. Your key vars:

```bash
DATABASE_URL=postgresql+asyncpg://finflow:password@localhost:5432/finflow
REDIS_URL=redis://localhost:6379/0
UIPATH_ACCOUNT_NAME=...
UIPATH_TENANT_NAME=...
UIPATH_CLIENT_ID=...
UIPATH_CLIENT_SECRET=...
UIPATH_ORCHESTRATOR_URL=...
UIPATH_FOLDER_NAME=FinFlow_Production
API_KEY=changeme-local-dev-key
BUREAU_API_MOCK=true
AADHAAR_API_MOCK=true
AML_API_MOCK=true
```

---

## Phase 1 — Data Models & Core Backend

### Key patterns for models

```python
# backend/models/case_models.py — example pattern
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import uuid

class LoanCase(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    applicant_id: str
    loan_type: LoanType
    loan_amount: float = Field(gt=0, le=10_000_000)
    current_stage: CaseStage = CaseStage.INTAKE
    case_status: CaseStatus = CaseStatus.OPEN
    risk_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    exception_count: int = 0
    assigned_officer: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Database connection pattern

```python
# backend/db/connection.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

engine = create_async_engine(
    os.getenv("DATABASE_URL"),
    echo=False,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

---

## Phase 2 — Maestro Case Definition

You are responsible for:
1. Configuring the `LoanApplication` case definition in UiPath Maestro UI
2. Exporting/documenting all configuration as JSON + markdown in the repo
3. Creating all Orchestrator Assets in `FinFlow_Production` folder

Document every stage transition rule in:
`uipath/maestro/case_definition/stage_transitions.md`

Structure:
```markdown
## Stage: intake → verification
Trigger condition: `documents_extracted = true AND all_docs_extracted = true`
Exception path: `exception_raised = true` → exception stage
Actor: DocuMind Agent (UiPath Agent Builder)
```

---

## Phase 4 — Document Verification RPA Robot

The robot flow in pseudocode:
```
Main.xaml:
  1. Get case_id from input argument
  2. Call GetDocuments.xaml → retrieve doc URLs from Orchestrator queue
  3. For each document:
     a. Download from storage
     b. Route to correct validator:
        - PAN card → ValidatePAN.xaml → calls PAN API
        - Aadhaar → ValidateAadhaar.xaml → calls UIDAI API
  4. If any document flagged:
     a. Call RaiseHumanTask.xaml → creates Action Center "Document Review" task
     b. Set case exception in Orchestrator queue
  5. Else: update case stage to "credit" via backend API webhook
```

Always use `Try/Catch` in XAML for every HTTP call.
Set reasonable retry counts: 3 retries with 5s delay.
Log all exceptions to UiPath Orchestrator via `Add Log Message` activity.

---

## Phase 8 — ExceptionHandler Automation

```
ClassifyException.xaml logic:
  Input: exception_type (string)
  
  AUTO_RESOLVABLE types:
    - "bureau_api_failure" → retry bureau call
    - "agent_timeout" → re-trigger agent
    - "low_confidence_extraction" → re-run DocuMind with enhanced prompt
  
  HUMAN_REQUIRED types:
    - "missing_document" → Action Center task
    - "kyc_mismatch" → Action Center task
    - "policy_breach" → Action Center task + senior officer email
  
  CRITICAL types:
    - "document_fraud_signal" → freeze case, alert compliance team
    - "watchlist_match" → freeze case, alert AML team
```

---

## Phase 10 — FastAPI Backend

### API routes to implement

```python
# POST /cases — create new loan case + trigger DocuMind via UiPath
# GET  /cases/{case_id} — get full case with all stage outputs
# GET  /cases/{case_id}/events — case event log
# POST /webhooks/documind — receive DocuMind completion callback
# POST /webhooks/creditsage — receive CreditSage completion callback
# POST /webhooks/complianceguard — receive ComplianceGuard callback
# POST /webhooks/decisionpilot — receive DecisionPilot callback
# POST /webhooks/action-center — receive human decision from Action Center
# GET  /health — health check
```

### UiPath Orchestrator Client pattern

```python
# backend/services/uipath_client.py
class UiPathClient:
    BASE_URL: str  # from env

    async def get_token(self) -> str:
        """OAuth2 client credentials flow"""
        ...

    async def trigger_process(self, process_name: str,
                               input_args: dict) -> str:
        """Start a UiPath process job, return job_id"""
        ...

    async def create_action_center_task(self, task_catalog: str,
                                         payload: dict) -> str:
        """Create Action Center task, return task_id"""
        ...

    async def update_case_attribute(self, case_id: str,
                                     attributes: dict) -> None:
        """Update Maestro Case attributes"""
        ...
```

---

## Phase 11 — Infrastructure

### backend.Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Deliverable Checklist

- [ ] All Phase 1 model, DB, and utility files created + tested
- [ ] Phase 2 Maestro Case documented with exported configs
- [ ] Phase 4 XAML robot files created + published to UiPath
- [ ] Phase 8 ExceptionHandler XAML files created + published
- [ ] Phase 10 all API routes + webhook handlers created + tested
- [ ] Phase 11 Dockerfile + docker-compose + CI yaml created
- [ ] `.env.example` complete with all keys you need
- [ ] No file exceeds 250 lines
- [ ] All mock modes work without external APIs
- [ ] REVIEW_LOG.md updated with completed task IDs
