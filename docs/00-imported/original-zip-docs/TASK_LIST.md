# TASK_LIST.md — FinFlow End-to-End Task List

> Owner: Claude Fable | Review gate on every [R] task before merge to main
> Rule: Every file ≤ 250 lines. No exceptions.
> Status: [ ] todo | [~] in progress | [x] done | [R] Claude Fable review

---

## PHASE 0 — Bootstrap (Claude Fable + Atchayam) — Day 1

- [ ] P0-01  Create GitHub repo `finflow` with MIT license + initial README
- [ ] P0-02  Register on Devpost: uipath-agenthack.devpost.com (click Join Hackathon)
- [ ] P0-03  Submit UiPath Labs access form: https://bit.ly/agenthack26form
- [ ] P0-04  Await UiPath Labs credentials email (≤3 business days)
- [ ] P0-05  Log into UiPath Automation Cloud Labs environment
- [ ] P0-06  Create Orchestrator Folder: `FinFlow_Production`
- [ ] P0-07  Create `.env.example` with all required env variable keys
- [ ] P0-08  Set up GitHub Actions CI (lint + pytest on every PR)
- [ ] P0-09  Create base `docker-compose.yml` for local PostgreSQL + Redis
- [ ] P0-10  Verify UiPath Maestro Case is available in Labs tenant

---

## PHASE 1 — Data Models & Core Backend (Codex)

### 1A — Pydantic Models

- [ ] P1-01  `backend/models/case_models.py` — LoanCase, CaseEvent, CaseStage (≤250)
- [ ] P1-02  `backend/models/document_models.py` — ExtractedDocument, DocField (≤250)
- [ ] P1-03  `backend/models/agent_models.py` — CreditScore, ComplianceResult, Decision (≤250)
- [ ] P1-04  `backend/models/exception_models.py` — ExceptionEvent, ResolutionResult (≤250)
- [ ] P1-05  `tests/unit/models/test_case_models.py`
- [ ] P1-06  `tests/unit/models/test_agent_models.py`
- [R] P1-07  Claude Fable reviews all model files

### 1B — Database Layer

- [ ] P1-08  `backend/db/connection.py` — async SQLAlchemy engine + session (≤250)
- [ ] P1-09  `backend/db/migrations/001_initial.sql` — loan_cases + case_events tables
- [ ] P1-10  `backend/db/repositories/case_repo.py` — CRUD for loan_cases (≤250)
- [ ] P1-11  `backend/db/repositories/event_repo.py` — CRUD for case_events (≤250)
- [ ] P1-12  `tests/unit/db/test_case_repo.py`
- [R] P1-13  Claude Fable reviews DB layer

### 1C — Shared Utilities

- [ ] P1-14  `backend/utils/logger.py` — structured JSON logging (≤250)
- [ ] P1-15  `backend/utils/validators.py` — loan amount, PAN, Aadhaar validators (≤250)
- [ ] P1-16  `backend/utils/exceptions.py` — CaseException, AgentException classes (≤250)
- [ ] P1-17  `backend/utils/config.py` — env variable loading via pydantic-settings (≤250)
- [R] P1-18  Claude Fable reviews utilities

---

## PHASE 2 — UiPath Maestro Case Definition (Codex)

- [ ] P2-01  Define Case Definition `LoanApplication` in UiPath Maestro UI
          - 5 stages: intake, verification, credit, compliance, decision
          - All stage transition rules configured
          - Exception stage + resolution transitions configured
- [ ] P2-02  `uipath/maestro/case_definition/case_config.json` — export of case config
- [ ] P2-03  `uipath/maestro/case_definition/stage_transitions.md` — documented rules
- [ ] P2-04  `uipath/maestro/case_definition/exception_rules.md` — exception config docs
- [ ] P2-05  Create UiPath Orchestrator Assets:
          - `FinFlow_APIBaseURL` (backend API URL)
          - `FinFlow_APIKey` (API key for backend auth)
          - `Bureau_APIKey` (credit bureau API key)
          - `Aadhaar_APIKey` (UIDAI Aadhaar verify API)
- [R] P2-06  Claude Fable reviews Maestro Case config documentation

---

## PHASE 3 — DocuMind Agent (Antigravity)

- [ ] P3-01  `uipath/agents/documind/agent_definition.json` — Agent Builder config export
- [ ] P3-02  `uipath/agents/documind/skills.md` — skills configured in Agent Builder
- [ ] P3-03  `uipath/agents/documind/prompts/extract_prompt.txt` — extraction prompt (≤250)
- [ ] P3-04  `uipath/agents/documind/prompts/classify_prompt.txt` — doc classification (≤250)
- [ ] P3-05  `uipath/agents/documind/test_cases/` — sample docs + expected outputs
- [ ] P3-06  Document Understanding model training:
          - Upload training samples for: Aadhaar, PAN, salary slip, bank statement
          - Train and publish model in UiPath Document Understanding
          - Export model endpoint config
- [ ] P3-07  `uipath/agents/documind/du_model_config.json` — DU model config export
- [ ] P3-08  `tests/integration/agents/test_documind.py` — integration test with sample docs
- [R] P3-09  Claude Fable reviews DocuMind agent

---

## PHASE 4 — Document Verification RPA Robot (Codex)

- [ ] P4-01  `uipath/rpa/document_validator/Main.xaml` — main workflow
- [ ] P4-02  `uipath/rpa/document_validator/GetDocuments.xaml` — fetch docs from storage
- [ ] P4-03  `uipath/rpa/document_validator/ValidatePAN.xaml` — PAN API validation
- [ ] P4-04  `uipath/rpa/document_validator/ValidateAadhaar.xaml` — Aadhaar API check
- [ ] P4-05  `uipath/rpa/document_validator/RaiseHumanTask.xaml` — Action Center task
- [ ] P4-06  `uipath/rpa/document_validator/project.json` — UiPath project config
- [ ] P4-07  Publish robot process to UiPath Orchestrator `FinFlow_Production` folder
- [ ] P4-08  `tests/integration/rpa/test_document_validator.md` — manual test checklist
- [R] P4-09  Claude Fable reviews RPA robot

---

## PHASE 5 — CreditSage Agent (Antigravity)

- [ ] P5-01  `backend/agents/creditsage/schemas.py` — input/output Pydantic models (≤250)
- [ ] P5-02  `backend/agents/creditsage/prompts.py` — credit analysis LLM prompts (≤250)
- [ ] P5-03  `backend/agents/creditsage/bureau_client.py` — mock bureau API client (≤250)
- [ ] P5-04  `backend/agents/creditsage/scorer.py` — DTI ratio + income scoring (≤250)
- [ ] P5-05  `backend/agents/creditsage/agent.py` — LangChain agent definition (≤250)
- [ ] P5-06  `backend/agents/creditsage/tools.py` — LangChain tools (bureau, scorer) (≤250)
- [ ] P5-07  `tests/unit/agents/creditsage/test_scorer.py`
- [ ] P5-08  `tests/unit/agents/creditsage/test_agent.py`
- [ ] P5-09  `tests/integration/agents/test_creditsage.py`
- [R] P5-10  Claude Fable reviews CreditSage agent

---

## PHASE 6 — ComplianceGuard Agent (Antigravity)

- [ ] P6-01  `uipath/agents/complianceguard/agent_definition.json` — Agent Builder config
- [ ] P6-02  `uipath/agents/complianceguard/skills.md` — skills documentation
- [ ] P6-03  `uipath/agents/complianceguard/prompts/aml_check_prompt.txt` (≤250)
- [ ] P6-04  `uipath/agents/complianceguard/prompts/kyc_verify_prompt.txt` (≤250)
- [ ] P6-05  `uipath/agents/complianceguard/prompts/rbi_rules_prompt.txt` (≤250)
- [ ] P6-06  Configure HTTP skills in Agent Builder for:
          - AML watchlist API (OFAC sanctions check)
          - KYC verification (Aadhaar UIDAI API)
          - RBI lending norms validation
- [ ] P6-07  `tests/integration/agents/test_complianceguard.py`
- [R] P6-08  Claude Fable reviews ComplianceGuard agent

---

## PHASE 7 — DecisionPilot Agent (Antigravity)

- [ ] P7-01  `backend/agents/decisionpilot/schemas.py` — input/output models (≤250)
- [ ] P7-02  `backend/agents/decisionpilot/prompts.py` — decision + rationale prompts (≤250)
- [ ] P7-03  `backend/agents/decisionpilot/policy_engine.py` — lending policy rules (≤250)
- [ ] P7-04  `backend/agents/decisionpilot/agent.py` — LangChain agent (≤250)
- [ ] P7-05  `backend/agents/decisionpilot/tools.py` — policy + report tools (≤250)
- [ ] P7-06  `tests/unit/agents/decisionpilot/test_policy_engine.py`
- [ ] P7-07  `tests/unit/agents/decisionpilot/test_agent.py`
- [ ] P7-08  `tests/integration/agents/test_decisionpilot.py`
- [R] P7-09  Claude Fable reviews DecisionPilot agent

---

## PHASE 8 — ExceptionHandler Automation (Codex)

- [ ] P8-01  `uipath/agents/exceptionhandler/Main.xaml` — main exception workflow
- [ ] P8-02  `uipath/agents/exceptionhandler/ClassifyException.xaml` — severity check
- [ ] P8-03  `uipath/agents/exceptionhandler/AutoResolve.xaml` — auto-resolution logic
- [ ] P8-04  `uipath/agents/exceptionhandler/EscalateToHuman.xaml` — Action Center task
- [ ] P8-05  `uipath/agents/exceptionhandler/project.json`
- [ ] P8-06  Publish ExceptionHandler to Orchestrator
- [R] P8-07  Claude Fable reviews ExceptionHandler

---

## PHASE 9 — UiPath Action Center Forms (Hermes)

- [ ] P9-01  Build "Document Review" task form in UiPath Apps:
          - Fields: applicant name, loan type, flagged docs with reason
          - Buttons: APPROVE_DOCS | REQUEST_RESUBMIT | ESCALATE
          - Export config: `uipath/maestro/action_center/doc_review_form.json`
- [ ] P9-02  Build "Loan Decision" task form in UiPath Apps:
          - Fields: full case summary, credit score, compliance status
          - DecisionPilot recommendation + rationale text
          - Buttons: APPROVE | REJECT | REFER_TO_CREDIT_COMMITTEE
          - Export config: `uipath/maestro/action_center/decision_form.json`
- [ ] P9-03  `uipath/maestro/action_center/forms_documentation.md`
- [R] P9-04  Claude Fable reviews Action Center forms

---

## PHASE 10 — FastAPI Backend (Codex)

- [ ] P10-01  `backend/api/main.py` — FastAPI app + middleware setup (≤250)
- [ ] P10-02  `backend/api/routes/cases.py` — POST/GET /cases endpoints (≤250)
- [ ] P10-03  `backend/api/routes/webhooks.py` — UiPath webhook receivers (≤250)
- [ ] P10-04  `backend/api/routes/health.py` — health check endpoint (≤250)
- [ ] P10-05  `backend/api/middleware/auth.py` — API key auth middleware (≤250)
- [ ] P10-06  `backend/services/case_service.py` — case business logic (≤250)
- [ ] P10-07  `backend/services/uipath_client.py` — UiPath Orchestrator API (≤250)
- [ ] P10-08  `backend/services/notification.py` — email notification stub (≤250)
- [ ] P10-09  `tests/integration/api/test_cases_api.py`
- [ ] P10-10  `tests/integration/api/test_webhooks.py`
- [R] P10-11  Claude Fable reviews all API files

---

## PHASE 11 — Infrastructure (Codex)

- [ ] P11-01  `infra/docker/backend.Dockerfile`
- [ ] P11-02  `infra/docker/docker-compose.yml` — full local stack
- [ ] P11-03  `.github/workflows/ci.yml` — lint + test on every PR
- [ ] P11-04  `infra/deploy/uipath_publish.md` — step-by-step UiPath publish guide
- [R] P11-05  Claude Fable reviews infra files

---

## PHASE 12 — Demo & Submission Docs (Hermes)

- [ ] P12-01  `docs/demo_script/DEMO_WALKTHROUGH.md` — 3-min step-by-step script
- [ ] P12-02  `docs/demo_script/SAMPLE_CASE.md` — sample loan case data for demo
- [ ] P12-03  `docs/submission/SUBMISSION.md` — Devpost submission text (draft)
- [ ] P12-04  `docs/architecture_diagram.png` — system architecture diagram image
- [ ] P12-05  Record 3-minute demo video (live Maestro Case walkthrough)
- [ ] P12-06  Upload demo video to YouTube (unlisted link)
- [ ] P12-07  Finalise Devpost submission with all required fields
- [R] P12-08  Claude Fable final review of all submission materials

---

## PHASE 13 — Final QA (Claude Fable)

- [R] P13-01  Line count audit — verify every file ≤ 250 lines
- [R] P13-02  Secrets audit — no hardcoded keys in any tracked file
- [R] P13-03  Schema audit — all agent I/O uses Pydantic models
- [R] P13-04  End-to-end case flow test — run a complete loan application through all 5 stages
- [R] P13-05  Exception flow test — trigger and resolve an exception in each stage
- [R] P13-06  HITL gate test — verify both Action Center tasks fire and complete correctly
- [R] P13-07  Demo video review — confirm all required features visible
- [R] P13-08  Devpost submission review — all fields complete, repo public, license visible
- [R] P13-09  Submit to Devpost before June 29, 2026 @ 11:45 PM EDT
- [R] P13-10  Update `REVIEW_LOG.md` with final Claude Fable sign-off

---

## Assignment Summary

| Phase | Assigned To | Deliverable |
|---|---|---|
| 0 | Claude Fable + Atchayam | Repo + UiPath Labs setup |
| 1 | Codex | Data models + DB layer + utils |
| 2 | Codex | Maestro Case definition |
| 3 | Antigravity | DocuMind agent |
| 4 | Codex | Document Verification RPA |
| 5 | Antigravity | CreditSage LangChain agent |
| 6 | Antigravity | ComplianceGuard agent |
| 7 | Antigravity | DecisionPilot LangChain agent |
| 8 | Codex | ExceptionHandler automation |
| 9 | Hermes | Action Center forms |
| 10 | Codex | FastAPI backend |
| 11 | Codex | Infrastructure + CI |
| 12 | Hermes | Demo + submission docs |
| 13 | Claude Fable | Final QA + submission |
