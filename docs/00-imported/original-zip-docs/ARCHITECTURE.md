# ARCHITECTURE.md — FinFlow System Architecture

> Owner: Claude Fable | Version: 1.0.0
> Hackathon: UiPath AgentHack 2026 — Track 1: UiPath Maestro Case

---

## 1. System Overview

FinFlow is an **end-to-end agentic loan case management system** built on UiPath
Automation Cloud. It demonstrates all four capabilities required to win Track 1:

1. **Dynamic case stages** — loan cases move through 5 well-defined stages
2. **Exception handling** — ExceptionHandler agent resolves edge cases automatically
3. **Human-in-the-loop** — Action Center tasks at Verification and Decision stages
4. **Multi-actor orchestration** — AI agents + RPA robots + human approvers unified

---

## 2. Case Flow Architecture

```
                     ┌─────────────────────────────────┐
                     │   UIPATH MAESTRO CASE ENGINE     │
                     │   (Orchestration Control Plane)  │
                     └──────────────┬──────────────────┘
                                    │ opens/advances case
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
   ┌──────────┐              ┌──────────────┐          ┌─────────────┐
   │  STAGE 1 │              │   STAGE 3    │          │   STAGE 5   │
   │  INTAKE  │──────────────│ CREDIT SCORE │──────────│  DECISION   │
   │          │  STAGE 2     │              │  STAGE 4 │             │
   │DocuMind  │  VERIFY      │ CreditSage   │  COMPLY  │DecisionPilot│
   │  Agent   │  RPA Robot   │   Agent      │  Guard   │  Agent +    │
   └──────────┘              └──────────────┘  Agent   │  Human      │
                                                        └─────────────┘
```

### Case Stage Definitions

| Stage | Name | Actor | Human Gate? | Exception? |
|---|---|---|---|---|
| 1 | Intake | DocuMind Agent | No | Yes — missing docs |
| 2 | Document Verification | RPA Robot | Yes — flagged docs | Yes — mismatch |
| 3 | Credit Score | CreditSage Agent | No | Yes — bureau failure |
| 4 | Compliance Check | ComplianceGuard Agent | No | Yes — AML flag |
| 5 | Decision | DecisionPilot Agent + Human | Yes — always | Yes — borderline |

---

## 3. UiPath Maestro Case — Configuration

```
Case Definition: LoanApplication
├── Case Attributes
│   ├── applicant_id: string
│   ├── loan_amount: decimal
│   ├── loan_type: enum [personal, home, business, vehicle]
│   ├── current_stage: enum [intake, verification, credit, compliance, decision]
│   ├── case_status: enum [open, in_progress, exception, approved, rejected, closed]
│   ├── risk_score: decimal (0.0 – 1.0)
│   ├── exception_count: integer
│   └── assigned_officer: string
│
├── Stage Transitions
│   ├── intake → verification    (trigger: documents_extracted = true)
│   ├── verification → credit   (trigger: documents_verified = true)
│   ├── credit → compliance     (trigger: credit_score_computed = true)
│   ├── compliance → decision   (trigger: compliance_cleared = true)
│   └── decision → closed       (trigger: human_decision_made = true)
│
└── Exception Transitions
    ├── any_stage → exception   (trigger: exception_raised = true)
    └── exception → any_stage   (trigger: exception_resolved = true)
```

---

## 4. AI Agent Architecture

### 4A. DocuMind (UiPath Agent Builder)

**Purpose:** Extract structured data from uploaded loan documents using UiPath
Document Understanding + AI extraction.

```
Inputs:  document_files[] (PDF/image), applicant_id
Process: 1. Classify document type (Aadhaar, PAN, salary slip, bank statement)
         2. Extract fields using Document Understanding ML model
         3. Validate extracted data completeness
         4. Raise exception if mandatory fields missing
Outputs: ExtractedDocument{} per file, validation_passed: bool
Tools:   UiPath Document Understanding, UiPath Storage (OSS)
Model:   UiPath Document Understanding (built-in ML)
Max lines per file: 250
```

### 4B. CreditSage (LangChain + UiPath Integration)

**Purpose:** Compute credit risk score using bureau data, income analysis,
and LLM-powered narrative reasoning.

```
Inputs:  applicant_id, extracted_documents{}, loan_amount, loan_type
Process: 1. Pull credit bureau data via CIBIL/Experian API
         2. Compute DTI ratio, income stability score
         3. LLM reasons over full financial profile
         4. Returns numeric score + explainability text
Outputs: CreditScore{score, band, rationale, recommendation}
Tools:   Bureau API adapter, LangChain LLMChain, UiPath HTTP Activity
Model:   Claude Sonnet (via LangChain) for narrative reasoning
Max lines per file: 250
```

### 4C. ComplianceGuard (UiPath Agent Builder)

**Purpose:** Run AML, KYC, and RBI regulatory checks on the applicant.

```
Inputs:  applicant_id, extracted_documents{}, credit_score{}
Process: 1. Check applicant against AML watchlists (OFAC, UN sanctions)
         2. Verify KYC documents against Aadhaar/PAN APIs
         3. Check RBI lending norms (LTV ratio, borrower category)
         4. Flag any regulatory exceptions
Outputs: ComplianceResult{passed, flags[], required_actions[]}
Tools:   UiPath HTTP Activity (watchlist APIs), UiPath Agent Builder
Model:   UiPath built-in agent (rule + LLM hybrid)
Max lines per file: 250
```

### 4D. DecisionPilot (LangChain + UiPath Integration)

**Purpose:** Generate final loan recommendation with full explainability for
the human approver's Action Center task.

```
Inputs:  all prior stage outputs, applicant profile, loan parameters
Process: 1. Synthesize credit score + compliance result + documents
         2. Apply bank's lending policy rules
         3. Generate recommendation: APPROVE / REJECT / REFER
         4. Write explainability report for human reviewer
Outputs: Decision{recommendation, confidence, rationale, conditions[]}
Tools:   LangChain LLMChain, UiPath Action Center (task creation)
Model:   Claude Sonnet for recommendation + explanation generation
Max lines per file: 250
```

### 4E. ExceptionHandler (UiPath Native Automation)

**Purpose:** Detect, classify, and attempt automatic resolution of case exceptions
before escalating to humans.

```
Inputs:  exception_type, exception_context, case_id
Process: 1. Classify exception severity (auto-resolvable vs human-needed)
         2. Attempt automatic resolution (re-run extraction, retry API)
         3. If resolved: resume case at failed stage
         4. If not: create Action Center task for human intervention
Outputs: ExceptionResult{resolved, resolution_method, escalated}
Tools:   UiPath native (Retry Scope, Try/Catch), Action Center
Max lines per file: 250
```

---

## 5. Human-in-the-Loop Design

Two mandatory human gates using UiPath Action Center:

### Gate 1 — Document Verification (Stage 2)

Triggered when: RPA robot flags suspicious/unclear documents.

```
Action Center Task: "Review flagged loan documents"
  - Shows: applicant name, flagged documents with reasons
  - Human actions: APPROVE_DOCS | REQUEST_RESUBMIT | ESCALATE
  - Timeout: 4 business hours → auto-escalate to senior officer
```

### Gate 2 — Final Decision (Stage 5)

Triggered: always at final stage (human must approve/reject).

```
Action Center Task: "Review loan decision recommendation"
  - Shows: full case summary, DecisionPilot recommendation + rationale
  - Human actions: APPROVE | REJECT | REFER_TO_CREDIT_COMMITTEE
  - Timeout: 8 business hours → escalate to branch manager
```

---

## 6. Backend API Architecture

```
backend/
├── api/
│   ├── main.py              # FastAPI app init (≤250 lines)
│   ├── routes/
│   │   ├── cases.py         # POST /cases, GET /cases/{id} (≤250 lines)
│   │   ├── webhooks.py      # UiPath → backend webhooks (≤250 lines)
│   │   └── health.py        # GET /health (≤250 lines)
│   └── middleware/
│       └── auth.py          # API key auth (≤250 lines)
│
├── agents/
│   ├── creditsage/
│   │   ├── agent.py         # LangChain agent definition (≤250 lines)
│   │   ├── bureau_client.py # Credit bureau API client (≤250 lines)
│   │   ├── scorer.py        # DTI + income scoring logic (≤250 lines)
│   │   └── prompts.py       # LLM prompt templates (≤250 lines)
│   └── decisionpilot/
│       ├── agent.py         # LangChain agent definition (≤250 lines)
│       ├── policy_engine.py # Bank lending policy rules (≤250 lines)
│       └── prompts.py       # Decision + rationale prompts (≤250 lines)
│
├── models/
│   ├── case_models.py       # Pydantic case/stage models (≤250 lines)
│   ├── document_models.py   # Extracted document models (≤250 lines)
│   └── decision_models.py   # Credit + decision models (≤250 lines)
│
├── services/
│   ├── case_service.py      # Case CRUD + state machine (≤250 lines)
│   ├── uipath_client.py     # UiPath Orchestrator API client (≤250 lines)
│   └── notification.py      # Email/SMS notification service (≤250 lines)
│
└── utils/
    ├── logger.py            # Structured logging (≤250 lines)
    ├── validators.py        # Input validation helpers (≤250 lines)
    └── exceptions.py        # Custom exception classes (≤250 lines)
```

---

## 7. UiPath Automation Cloud — Resource Map

```
UiPath Automation Cloud (Labs Environment)
├── Orchestrator
│   ├── Folder: FinFlow_Production
│   ├── Processes: DocuMind, ComplianceGuard, ExceptionHandler, DocValidator
│   └── Assets: API keys, bureau credentials, policy configs
│
├── Maestro
│   └── Case Definition: LoanApplication (5 stages, all transitions)
│
├── Action Center
│   ├── Task Catalog: "Document Review", "Loan Decision"
│   └── Task Forms: UiPath Apps (web-based forms)
│
├── Document Understanding
│   └── ML Models: KYC docs, salary slips, bank statements
│
└── AI Center (optional)
    └── Custom ML pipeline for fraud signal detection
```

---

## 8. Data Models

### LoanCase (PostgreSQL)

```sql
CREATE TABLE loan_cases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id    VARCHAR(50) NOT NULL,
    loan_type       VARCHAR(20) NOT NULL,
    loan_amount     DECIMAL(15,2) NOT NULL,
    current_stage   VARCHAR(30) NOT NULL DEFAULT 'intake',
    case_status     VARCHAR(20) NOT NULL DEFAULT 'open',
    risk_score      DECIMAL(5,4),
    exception_count INTEGER DEFAULT 0,
    assigned_officer VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE case_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID REFERENCES loan_cases(id),
    event_type  VARCHAR(50) NOT NULL,
    stage       VARCHAR(30),
    actor       VARCHAR(100),
    payload     JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Submission Requirements Checklist

| Requirement | Implementation |
|---|---|
| Working solution on UiPath Automation Cloud | Maestro Case + all agents deployed |
| Uses UiPath as orchestration layer | Maestro Case coordinates all agents |
| Public GitHub repo with source code | Full repo + MIT license |
| Demo video (~3 minutes) | Live walkthrough of full loan case flow |
| Architecture diagram | `docs/architecture_diagram.png` |
| Devpost submission text | `docs/submission/SUBMISSION.md` |
| Track identification | Track 1: UiPath Maestro Case |

---

## 10. Judging Criteria — How We Score

| Criterion | Score Target | Evidence |
|---|---|---|
| Agentic orchestration & innovation | High | 5 agents, Maestro Case, LangChain integration |
| Business impact | High | Loan TAT metric: days → minutes |
| Technical implementation | High | Production-grade, error handling, HITL |
| Completeness | Full | End-to-end working, not demo-only |
| Presentation | Polished | 3-min demo video + explainability UI |
