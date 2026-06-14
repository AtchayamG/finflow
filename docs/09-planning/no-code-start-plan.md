# No-Code Start Plan

This plan defines what happens before development begins.

## User Instruction

Do not start coding until the user explicitly says to start development.

Allowed before that:
- research official rules and resources,
- preserve attached docs,
- create or improve planning docs,
- inspect previous hackathon projects,
- prepare Devpost registration up to legal confirmation,
- propose architecture and delegation plan.

Not allowed before that:
- implementing backend, frontend, agents, tests, deployment scripts, or UiPath packages,
- creating final public claims,
- submitting Devpost final project,
- accepting eligibility/rules acknowledgements without explicit user confirmation.

## Recommended Project Direction

Product: FinFlow, an AI-powered loan and credit case management workflow.

Primary track: Track 1, UiPath Maestro Case.

Core demo:
- Case A: clean personal loan application moves through intake, verification, credit, compliance, human final approval.
- Case B: flagged document creates an exception, Action Center human review resolves it, case resumes.

Primary proof:
- UiPath Maestro Case orchestrates stages.
- Agent Builder agents handle document and compliance tasks.
- Python coded agents handle credit analysis and decision rationale.
- Action Center keeps humans in the loop.
- Mock local mode proves repeatability without secrets.

## Planned Build Sequence After Approval

1. Complete Devpost registration and UiPath Labs access request.
2. Create clean repo structure and root README/license.
3. Convert imported docs into source-of-truth architecture, contracts, and task packets.
4. Build deterministic local mock mode for one clean case and one exception case.
5. Add tests for scoring, policy decisions, contracts, and API callbacks.
6. Build minimal judge-facing dashboard or console only after core workflow works.
7. Configure UiPath Labs: Maestro Case, Agent Builder agents, Action Center forms, Document Understanding samples.
8. Capture platform proof and smoke checks.
9. Prepare public repo, demo video, presentation deck, and Devpost draft.
10. Run final truth review and leave final submit to user.

## First Delegation Packets After Approval

| Packet | Owner | Scope |
|---|---|---|
| FNF-HERMES-001 | Hermes Step Flash | Clean Devpost draft, demo outline, screenshot checklist |
| FNF-NEMOTRON-001 | Hermes Nemotron | Architecture risk review and Track 1 fit critique |
| FNF-ANTIGRAVITY-001 | Antigravity | Narrow implementation slice after contracts are stable |
| FNF-CODEX-001 | Codex | Repo skeleton, contracts, tests, integration review |

## Current Blockers

- User must confirm eligibility and authorization before Devpost Register is clicked.
- UiPath Labs access is not yet requested or received.
- Development is paused by user instruction.
