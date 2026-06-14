# FinFlow Product Blueprint

FinFlow is a production-oriented hackathon MVP for agentic loan case management
on UiPath. It is designed for UiPath AgentHack Track 1: Maestro Case.

## Demo Story

One personal-loan case proves the full journey:

1. Officer creates a loan application for a synthetic applicant.
2. Backend opens a case and records the intake event.
3. Document agent extracts synthetic PAN, masked Aadhaar, salary slip, and bank
   statement data.
4. Verification raises a low-confidence document exception.
5. Human reviewer approves corrected document data.
6. Mock credit bureau provider returns bureau data through the backend.
7. Deterministic scoring calculates DTI, risk score, and policy result.
8. Mock compliance provider runs KYC, AML, and lending-rule checks.
9. Decision agent generates explainable recommendation text from deterministic
   outcomes.
10. Human officer approves, rejects, or refers the case.
11. Case closes with full timeline and audit record.

## Product Surfaces

- `/login`: secure auth entry, no dashboard content.
- `/dashboard`: operational overview and approval queue.
- `/cases`: searchable case list with stage, SLA, risk, and owner.
- `/cases/{case_id}`: full case details and timeline.
- `/cases/{case_id}/documents`: document-review task.
- `/cases/{case_id}/decision`: final human decision task.
- `/exceptions`: exception queue and resolution details.
- `/analytics`: throughput, bottlenecks, and mock business impact.
- `/settings`: UiPath/provider/workflow configuration.
- `/profile`: officer profile, role, approval limits, and security state.

## Design Reference

All implementation must reference:

```text
finflow-ui-ux-reference/
```

The reference pack contains 10 dark and 10 light PNGs with exact screen names.
The product should match their density, theme direction, and workflow hierarchy.

## System Boundary

```text
React UI
-> FastAPI backend
-> UiPath client abstraction
-> Maestro Case / Orchestrator boundary
-> provider-backed agents and Action Center callbacks
-> backend event store
-> React UI polling/status refresh
```

Local demo mode uses mock providers and a simulated UiPath client, but it still
passes through backend endpoints and case events.

## Truthfulness Language

Use:

- "production-oriented hackathon MVP",
- "mock provider",
- "simulated UiPath client" until Labs proof exists,
- "UiPath-ready orchestration boundary".

Avoid:

- "fully production-ready",
- "live CIBIL/PAN/Aadhaar/AML verification",
- "deployed on UiPath Automation Cloud" before evidence exists.
