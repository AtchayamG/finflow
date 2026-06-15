# FinFlow Devpost Draft

## Project Name
FinFlow

## Track
Track 1: UiPath Maestro Case

## Tagline
AI-powered loan case management with human-in-the-loop control.

## Problem
Loan processing in banking operations is slow because document review, credit
assessment, compliance checks, exceptions, and approvals often live across
disconnected tools. Officers need traceability and control, not a black-box
approval bot.

## Solution
FinFlow is a production-oriented hackathon MVP that models a loan application as
a case. The workflow creates a loan case, raises a document-review exception,
records a human correction, runs deterministic credit and policy checks, clears
mock compliance providers, generates an explainable recommendation, and records
the final human decision.

## UiPath Usage
Planned / pending verification:

- UiPath Maestro Case as orchestration layer.
- UiPath Agent Builder for document and compliance agents.
- UiPath Action Center for document review and final decision.
- UiPath Orchestrator/RPA boundary for document verification.

Current local implementation includes a simulated UiPath client, import-ready
Maestro/Action Center/Agent Builder specs, and mock providers while Labs access
is pending.

## Built With
- FastAPI
- React + TypeScript
- UiPath-ready orchestration boundary
- Mock credit, identity, and compliance providers
- Coding agents: Codex, Hermes, Antigravity task model

## What Works Locally
- Backend E2E workflow
- Frontend wired to cases, events, exceptions, analytics, document review, and decisions
- Document exception and human-review callback
- Strong approve path and weak refer/reject paths
- SQLite event history and audit trail
- Dark/light UI
- Test suite, Docker compose, and GitHub Actions CI definition

## Links
- GitHub: https://github.com/AtchayamG/finflow
- Devpost draft: https://devpost.com/submit-to/29624-uipath-agenthack/manage/submissions/1051319-finflow/finalization
- Preview: https://devpost.com/software/finflow-e57qmy
- Demo video: https://youtu.be/NtKwIzjGJ3E
- Presentation deck: https://github.com/AtchayamG/finflow/raw/main/assets/submission/finflow-pitch-deck.pdf
- UiPath proof: BLOCKED pending Labs access

## Devpost Status 2026-06-15

Codex filled and saved the Project details and Additional info pages, uploaded
the submission gallery images from `assets/submission/`, published the demo
video on YouTube, and reached the final Submit page.

Final submit is intentionally not clicked yet. The final Devpost reminder says
the UiPath Platform must be the orchestration layer, and the current evidence
still shows only a simulated UiPath client plus import-ready artifacts. Submit
only after live UiPath Automation Cloud/Labs execution proof is available.
