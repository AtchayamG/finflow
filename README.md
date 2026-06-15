# FinFlow

FinFlow is a production-oriented hackathon MVP for UiPath AgentHack 2026,
Track 1: UiPath Maestro Case.

Public repo: https://github.com/AtchayamG/finflow

## What It Does

FinFlow models a synthetic loan application as a case workflow:

1. Create a loan case.
2. Run DocuMind document extraction and raise a low-confidence exception.
3. Resolve the document gate through an Action Center-style callback.
4. Run verification, CreditSage, ComplianceGuard, and DecisionPilot.
5. Send the final decision to a human officer gate.
6. Close as approved, rejected, or referred with a persisted audit trail.

## Current Status

Working locally:

- FastAPI backend with SQLite persistence and in-memory test mode.
- Pydantic agent contracts matching `AGENT_CONTRACTS.md`.
- Mock DocuMind, CreditSage, ComplianceGuard, DecisionPilot, and ExceptionHandler.
- Simulated UiPath client with `trigger_process`, `create_action_center_task`,
  and `update_case_attribute`.
- Webhook auth middleware, bypassed only in explicit local mock mode.
- React UI with dark/light themes and 10 product screens.
- Live API wiring for cases, events, exceptions, analytics, document review, and
  final decision actions.
- Offline UiPath import specs under `uipath/`.
- CI workflow and Docker compose stack.

Blocked / human-gated:

- UiPath Labs tenant access and live Automation Cloud proof.
- Demo video upload.
- Presentation deck publication.
- Final Devpost submission.

## Run Backend

```powershell
cd services/api
C:\Users\Atchayam\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m pip install -r requirements.txt
C:\Users\Atchayam\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8781
```

Health check: http://127.0.0.1:8781/health

## Run Frontend

```powershell
cd apps/web
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Preview build:

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4174
```

## Docker

```powershell
cd infra/docker
docker compose config
docker compose up --build
```

## Verification

Backend:

```powershell
cd services/api
C:\Users\Atchayam\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m pytest -q
```

Frontend:

```powershell
cd apps/web
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

## UiPath Components

Implemented offline:

- Maestro case definition specs in `uipath/maestro/case_definition/`.
- Action Center form specs in `uipath/maestro/action_center/`.
- Agent Builder specs for DocuMind and ComplianceGuard in `uipath/agents/`.
- Backend `SimulatedUiPathClient` ready to swap for real tenant calls by config.

Pending live proof:

- Import into UiPath Automation Cloud Labs.
- Run Maestro Case and Action Center forms in the tenant.
- Record video evidence from the platform.

## Real vs Simulated

| Area | Current truth |
|---|---|
| Case workflow | Real local FastAPI workflow |
| Persistence | Real SQLite local persistence |
| UiPath client | Simulated UiPath client |
| Maestro/Action Center | Import-ready offline specs |
| Credit bureau | Mock provider, deterministic by applicant data |
| PAN/Aadhaar/AML | Mock provider only, synthetic data only |
| LLM narrative | Deterministic fallback text |

## Coding Agents Used

- Codex: CTO/integrator, backend, frontend wiring, UiPath specs, CI, docs.
- Hermes: Planned low-cost docs/QA worker; local CLI access was available but
  the long-running review attempt timed out, so no unreviewed Hermes output is
  claimed as merged.
- Antigravity: Planned UI/agent review worker; no local CLI/tool was available
  in this session, so contribution remains documented intent only.

## UI Reference Pack

The visual target lives at `finflow-ui-ux-reference/` with 10 dark and 10 light
PNG references: login, dashboard, cases, case details, document review, decision,
exceptions, analytics, settings, and profile.

## Truthfulness

Use: "mock provider", "simulated UiPath client", and "UiPath-ready orchestration
boundary". Do not claim live CIBIL, PAN, Aadhaar, AML, deployed UiPath Automation
Cloud execution, demo video, or final Devpost submission until verified.
