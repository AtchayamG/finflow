# FinFlow Development Philosophy And Submission Priorities

Source: user-provided project directive, 2026-06-14.

FinFlow is a UiPath-powered agentic loan-processing case-management application
for a hackathon submission. This document is mandatory project guidance.

## Core Principle

Build a working end-to-end product, not UI alone.

The minimum working journey:

```text
Loan application created
-> Documents uploaded
-> Document data extracted
-> Verification performed
-> Credit assessment completed
-> Compliance checks completed
-> AI recommendation generated
-> Human approval completed
-> Case closed
```

The UI must reflect real workflow state from the backend and UiPath integration
boundary. It must not bypass the backend by reading finished results directly
from static JSON.

## UiPath Role

UiPath must remain the core orchestration layer.

Target architecture:

```text
Frontend
-> Backend API
-> UiPath Maestro / Orchestrator
-> Agents, RPA and Action Center
-> Backend
-> Frontend status update
```

If Maestro Case is available in Labs, FinFlow uses Track 1: UiPath Maestro Case.
If access is blocked, the project must clearly mark live platform proof as
BLOCKED and keep the local mock mode honest.

## Backend Requirements

The backend must support:

- case creation and retrieval,
- case-stage updates,
- agent invocation,
- UiPath webhook handling,
- exception recording,
- human-decision callbacks,
- case-event history,
- health checks.

Minimum endpoints:

```text
POST /cases
GET /cases
GET /cases/{case_id}
GET /cases/{case_id}/events
POST /webhooks/documind
POST /webhooks/creditsage
POST /webhooks/complianceguard
POST /webhooks/decisionpilot
POST /webhooks/action-center
GET /health
```

Persistent storage is preferred. SQLite is acceptable for the hackathon MVP if
the database path is documented and does not weaken the demo.

## Mock Provider Rule

Mock integrations are allowed and recommended for restricted external services:

- credit bureau / CIBIL,
- PAN and Aadhaar verification,
- AML and sanctions screening,
- bank account and income verification.

Provider abstractions must support explicit modes:

```text
MOCK
SANDBOX
LIVE
```

Mock responses must travel through the real backend workflow. Never claim mock
verification is live production verification.

## Decision Safety

Use deterministic rules for important decisions:

- EMI calculation,
- debt-to-income ratio,
- loan-to-value ratio,
- credit score thresholds,
- eligibility rules,
- compliance rules,
- mandatory rejection conditions,
- referral thresholds,
- policy limits.

Policy precedence:

```text
Hard compliance or policy failure
-> AI cannot approve
Deterministic rule result
-> Controls valid outcomes
LLM
-> Explains outcome and evidence
Human officer
-> Final decision
```

## Human-In-The-Loop

At least two human review experiences are mandatory:

- Document Review: approve documents, request resubmission, or escalate.
- Final Loan Decision: approve, reject, or refer to credit committee.

Each human action records reviewer, decision, reason, timestamp, and override
reason when applicable.

## Exception Handling

The demo must include at least one visible exception scenario. Exceptions record:

```text
case_id
source stage
exception type
severity
message
timestamp
retry count
resolution status
resolved by
resolution notes
```

Exception classes: `AUTO_RESOLVABLE`, `HUMAN_REQUIRED`, `CRITICAL`.

## UI Requirements

Desktop first:

- 1440px,
- 1280px,
- 1024px.

Required routes:

```text
/login
/dashboard
/cases
/cases/{case_id}
/cases/{case_id}/documents
/cases/{case_id}/decision
/exceptions
/analytics
/settings
/profile
```

Both dark and light themes must be supported. Human approval views and essential
case summaries must be usable on mobile/tablet.

## Security And Privacy

- Never commit `.env` or secrets.
- Mask Aadhaar/PAN and demo identifiers.
- Do not log raw identity documents.
- Do not send unnecessary PII to LLMs.
- Validate uploaded file types and sizes.
- Protect webhook endpoints.
- Add correlation IDs and audit logs.
- Use synthetic applicant information in demo data.

## Development Order

1. Shared contracts and case-state model.
2. Backend and database.
3. UiPath Maestro Case workflow boundary.
4. Mock external-service providers.
5. Document extraction and verification.
6. Credit and policy calculations.
7. Compliance checks.
8. Decision recommendation.
9. Action Center human tasks.
10. Exception handling and retries.
11. Frontend connected to real backend state.
12. Dark and light theme refinement.
13. Mobile approval experiences.
14. Analytics and optional features.
15. Testing, demo data, docs, and submission assets.

## Definition Of Done

Submission-ready only when:

- a loan case can be created,
- the case progresses through real workflow stages,
- mock services are called through provider layers,
- at least one agent-like component executes,
- at least one UiPath/RPA integration boundary exists,
- at least one exception path works,
- at least one human-review task works,
- a final human decision can be recorded,
- the case timeline is visible,
- frontend reflects backend workflow state,
- dark and light themes work,
- mobile human approval is usable,
- setup docs and demo data exist,
- core tests pass,
- no secrets are committed,
- the demo is reproducible from a clean setup.

Working end-to-end case flow takes priority over additional UI polish or optional
features.
