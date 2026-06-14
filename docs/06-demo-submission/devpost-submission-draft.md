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

Current local implementation includes a simulated UiPath-ready backend boundary
and mock providers while Labs access is pending.

## Built With
- FastAPI
- React + TypeScript
- UiPath-ready orchestration boundary
- Mock credit, identity, and compliance providers
- Coding agents: Codex, Hermes, Antigravity task model

## What Works Locally
- Backend E2E workflow
- Frontend E2E demo trigger
- Document exception and human-review callback
- Final human approval
- Event history
- Dark/light UI
- Test suite

## Links
- GitHub: TODO
- Demo video: TODO
- Presentation deck: TODO
- UiPath proof: BLOCKED pending Labs access
