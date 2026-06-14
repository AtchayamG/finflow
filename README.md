# FinFlow

FinFlow is a production-oriented hackathon MVP for UiPath AgentHack Track 1:
UiPath Maestro Case.

It demonstrates an agentic loan-processing case workflow with:

- a FastAPI backend,
- deterministic credit and policy rules,
- mock provider layers for restricted banking integrations,
- a human document-review exception,
- a final human loan decision,
- a React dashboard with dark and light themes,
- UI/UX references for 10 required product screens.

## Current Status

Working locally:

- case creation,
- document exception,
- human document review callback,
- verification,
- mock credit scoring,
- mock compliance checks,
- AI-style recommendation wrapper from deterministic rules,
- final human approval,
- event history,
- React UI E2E demo button connected to the backend.

Blocked / pending:

- Devpost registration requires user eligibility and rules/terms confirmation.
- UiPath Labs access and live Maestro Case proof are pending.
- UiPath client currently runs as a local mock/simulation boundary.

## Run Backend

```powershell
cd services/api
C:\Users\Atchayam\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m pip install -r requirements.txt
C:\Users\Atchayam\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8781
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8781/health
```

## Run Frontend

```powershell
cd apps/web
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

For preview:

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4174
```

## Test

Backend:

```powershell
cd services/api
C:\Users\Atchayam\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m pytest -q
```

Frontend:

```powershell
cd apps/web
npm.cmd run test
npm.cmd run build
```

## UI Reference Pack

The visual target lives at:

```text
finflow-ui-ux-reference/
```

It contains 10 dark and 10 light PNG references:

- login,
- dashboard,
- cases,
- case details,
- document review,
- decision,
- exceptions,
- analytics,
- settings,
- profile.

## Truthfulness

FinFlow uses mock providers by default. Do not claim live CIBIL, Aadhaar, PAN,
AML, or UiPath Automation Cloud execution until those integrations are verified.
