# Codex Autonomous Completion Prompt — FinFlow

Paste everything inside the fenced block below into Codex, running from the repo
root (`D:\Work\Codex\Hackathon Projects\FinFlow`). It is written as a self-driving
task packet in the project's own operating-model format. It tells Codex to take
the project to a deep, demo-ready, truthful state, complete every piece that does
**not** require live UiPath Labs access, and stop cleanly at the human-gated tail.

---

```text
ROLE
You are Codex, CTO and integrator for FinFlow (UiPath AgentHack 2026, Track 1:
UiPath Maestro Case). You are completing the project autonomously to a
demo-ready, truthful, submission-ready state for human final review. Work from
the repo root. Read these files FIRST and treat them as binding:
- docs/09-planning/finflow-gap-analysis-and-remediation-plan.md  (the plan you execute)
- docs/09-planning/uipath-labs-access-request.md                 (access collateral to keep in sync)
- docs/00-imported/original-zip-docs/AGENT_CONTRACTS.md          (exact schemas)
- docs/02-product/blueprint.md                                   (surfaces + truthfulness language)
- docs/01-hackathon/uipath-agenthack-requirements.md             (what judges require)
- docs/04-agents/cto-operating-model.md                          (delegation + stop conditions)
- finflow-ui-ux-reference/ (dark + light PNGs)                   (visual target)

NON-NEGOTIABLE RULES
1. Every source file <= 250 lines. Split at logical boundaries.
2. No hardcoded secrets. Env only (pydantic-settings / import.meta.env). Mock
   modes must run with ZERO API keys.
3. All agent inputs/outputs are Pydantic models matching AGENT_CONTRACTS.md exactly.
4. Async/external calls have timeout + try/except + typed exceptions + structured logs.
5. Truthfulness language from blueprint.md. Use "mock provider", "simulated
   UiPath client", "UiPath-ready orchestration boundary". NEVER claim live
   CIBIL/PAN/Aadhaar/AML, "deployed on UiPath Automation Cloud", a demo video,
   CI passing on a public badge, or Devpost submission unless it is actually true.
6. Keep all demo data SYNTHETIC. Do NOT render realistic identity-document
   replicas. Keep the synthetic document placeholder approach.
7. Do not delete the reference pack or the planning docs.

HARD STOP CONDITIONS (do not attempt; report as BLOCKED)
- Anything requiring live UiPath Automation Cloud / Labs login or tenant access.
- Recording or uploading the demo video.
- Final Devpost submission or any legal/eligibility action.
- Committing or pasting any secret, token, key, or private account detail.
If you hit one, leave a clearly labeled TODO/BLOCKED marker and keep going on
everything else.

WORKING METHOD
- Work milestone by milestone in the order below. After each milestone: run its
  verification commands, fix failures, and only then continue.
- Make small, frequently-committed changes with clear messages. Never commit
  secrets or build artifacts.
- After all milestones, run the FULL verification suite and produce a final
  report in the exact Reporting Format at the end.
- If a design choice is ambiguous, pick the option that best matches the
  reference pack and AGENT_CONTRACTS.md, and note it under RISK.

================================================================================
MILESTONE 0 — UiPath Labs access collateral (do this FIRST; ~3-day lead time)
================================================================================
GOAL: Prepare everything the human needs to submit the UiPath Labs access form
today, since access can take ~3 business days and blocks the platform demo.
You PREPARE the text; you do NOT submit the form (human-gated, identity/eligibility).

DO:
- Read docs/09-planning/uipath-labs-access-request.md. Keep it accurate and in
  sync with the actual build (component list, repo URL, project summary).
- Ensure the requested UiPath components named there match what the rest of this
  build actually produces import-ready configs for (Maestro Case, Action Center
  forms, Agent Builder agents, Document Understanding, Orchestrator).
- In docs/06-demo-submission/submission-evidence-checklist.md, confirm the
  "UiPath Labs access requested" row is clearly TODO with an owner of User, and
  add a one-line note: "Draft ready in docs/09-planning/uipath-labs-access-request.md".
- Do NOT invent identity data, tenant URLs, tokens, or secrets.

VERIFY:
- The access-request doc parses, is <=250 lines, contains no secrets, and its
  component list matches Milestone 4 artifacts.
- Report under NEXT (top item): "User: submit UiPath Labs access form now."

================================================================================
MILESTONE 1 — Backend depth: agents, providers, persistence, auth
================================================================================
GOAL: Replace the hardcoded deterministic stub with a real (mock-mode) agent
layer and durable storage, matching AGENT_CONTRACTS.md.

DO:
- Add backend/agents/ with mock-mode implementations whose I/O match the
  contracts: CreditSage (bureau_client mock + scorer + optional LLM rationale
  with deterministic fallback), DecisionPilot (policy_engine + recommendation +
  executive_summary + detailed_rationale), DocuMind (simulated extraction with
  confidence + low-confidence exception), ComplianceGuard (AML/KYC/RBI mock
  checks that can actually flag), ExceptionHandler (classify AUTO_RESOLVABLE /
  HUMAN_REQUIRED / CRITICAL per AGENT_CONTRACTS.md).
- Bureau data and compliance results MUST vary with applicant inputs so that a
  weak applicant yields REFER/REJECT and flags. Remove the hardcoded 762 / always-
  pass / fixed-0.87 behavior; derive them.
- Optional LLM: if an LLM key is present use it for narrative text only; with no
  key, fall back to deterministic templates. LLM never changes the deterministic
  decision — it only explains it.
- Persistence: SQLite by default (path via env, git-ignored), Postgres optional
  via DATABASE_URL. Keep an in-memory mode for tests. Cases + events + exceptions
  survive restart in non-test mode.
- Webhook auth: enforce a shared-secret header (FINFLOW_WEBHOOK_TOKEN) on every
  /webhooks/* route; 401 on missing/invalid; bypass only in explicit local mock mode.
- Add a UiPath adapter: backend/services/uipath_client.py defining an interface
  (trigger_process, create_action_center_task, update_case_attribute) plus a
  SimulatedUiPathClient. Wire the workflow through it so swapping in a real client
  later is config-only. Label clearly as simulated.

VERIFY:
- cd services/api && python -m pytest -q  → all pass
- New unit tests cover: scorer/policy edge cases, a REJECT path, a REFER path,
  compliance flagging, exception classification, webhook 401.

================================================================================
MILESTONE 2 — API completeness
================================================================================
GOAL: The API exposes everything the UI needs for full E2E, not just the demo.

DO:
- Ensure routes exist and are tested: create case, list cases, get case, get
  events, run each step, document-review callback (approve / request_resubmit /
  escalate), final decision (approve / reject / refer), exceptions list, and a
  dashboard/analytics summary endpoint computed from real case state.
- Keep route files <=250 lines; split into routers (cases, webhooks, health,
  analytics). Add API-key middleware where appropriate; health stays public.
- Reconcile the stage model end to end (include document_review/exception) so the
  frontend pipeline can reflect every stage.

VERIFY:
- pytest green, including new integration tests for cases + webhooks + analytics.

================================================================================
MILESTONE 3 — Frontend: wire to backend + raise UI to reference fidelity
================================================================================
GOAL: Every one of the 10 screens is live against the backend and visually
matches the reference pack's density and hierarchy in BOTH themes.

DO:
- Replace static-only rendering: on load, fetch live cases; create-case form
  posts to the API; clicking a case row selects and opens it; document-review and
  decision screens submit real human actions; status polls and the event timeline,
  exceptions, and analytics all render from backend data. Keep a seed path so the
  app still demos if the backend is empty.
- Fix selection (no more cases[0]) and add a demo-credential login gate
  (env-config, clearly labeled demo login, no real secret).
- Uplift each screen toward finflow-ui-ux-reference/ :
  * Dashboard: metric cards, multi-column case pipeline table, SLA-risk donut,
    agent activity feed, approval queue, exceptions heatmap, case-insights.
  * Document review: flagged-doc list, synthetic doc viewer, extracted-data with
    confidence meter, structured review-decision panel.
  * Decision: credit gauge, risk + compliance panels, policy checklist, AI
    recommendation + confidence, approved-amount field, documents-considered
    table, audit timeline.
  * Cases, Case-details, Exceptions, Analytics, Settings, Profile: raise to
    reference density. Charts via a light lib (Recharts) or hand-rolled SVG.
  * Maintain dark/light parity and the existing teal token system. No text
    overlap at 1440 / 1280 / 1024 / mobile widths.
- Keep Login a pure auth screen (no embedded dashboard content), per the
  reference rules.
- Make the Settings screen's claims true (or labeled simulated) now that auth exists.

VERIFY:
- cd apps/web && npm run test && npm run build  → both pass, no type errors.
- Add at least one component/render test (e.g., dashboard renders metrics from a
  mocked API; case row click selects).

================================================================================
MILESTONE 4 — UiPath-ready artifacts (offline-authorable)
================================================================================
GOAL: Produce every UiPath configuration artifact that can be authored WITHOUT a
tenant, so the human can import them once Labs access arrives.

DO (create under uipath/ , documented, no tenant calls):
- maestro/case_definition/case_config.json + stage_transitions.md + exception_rules.md
  (5 stages + exception + closed, transition + exception rules matching the backend).
- maestro/action_center/doc_review_form.json + decision_form.json + forms_documentation.md
  (fields + buttons per AGENT_CONTRACTS.md Action Center payloads; mobile-friendly).
- agents/documind/agent_definition.json + prompts + skills.md (Agent Builder spec).
- agents/complianceguard/agent_definition.json + prompts + skills.md.
- A short uipath/README.md mapping each artifact to its import step, clearly
  stating these are import-ready specs validated offline, NOT live-tenant proof.

VERIFY:
- All JSON parses. Markdown <=250 lines each. No secrets.

================================================================================
MILESTONE 5 — Infrastructure + CI
================================================================================
GOAL: Reproducible local stack and automated checks.

DO:
- infra/docker/backend.Dockerfile, infra/docker/web.Dockerfile (or root
  Dockerfiles), infra/docker/docker-compose.yml (api + web + optional postgres).
- .github/workflows/ci.yml: install, lint, pytest, vitest, web build on push/PR.
- Update .env.example with every key actually used; document each.

VERIFY:
- docker compose config validates. CI yaml is syntactically valid. .env.example
  has no real values.

================================================================================
MILESTONE 6 — Submission docs (truthful) + coding-agent evidence
================================================================================
GOAL: Everything a judge reads is accurate and complete up to the human-gated tail.

DO:
- README: update UiPath-components section to match the actual build (simulated
  client + import-ready artifacts), refresh run/test instructions, add a
  "Coding Agents Used" section (Codex / Hermes / Antigravity — what each did),
  and a clear "What is real vs simulated" table.
- docs/06-demo-submission/: refresh devpost-submission-draft.md and
  submission-evidence-checklist.md to reflect the new reality; keep TODO/BLOCKED
  on video, deck, live UiPath proof, and final submit.
- docs/06-demo-submission/demo-walkthrough.md: a rehearsable <=5 min (target ~3)
  script driven entirely by the now-working local product.
- Create an architecture diagram source (Mermaid in a .md is fine) showing the
  5 agents + Maestro Case boundary + Action Center human gates + backend + UI.
- Create a presentation-deck outline (markdown) ready to be turned into slides.
- Update REVIEW_LOG.md marking which phases are now done locally vs still
  blocked on Labs.

VERIFY:
- All markdown <=250 lines. No false claims. Links that don't exist yet are
  labeled TODO/BLOCKED.

================================================================================
FINAL FULL VERIFICATION (run all, fix everything, then report)
================================================================================
- cd services/api && python -m pytest -q
- cd apps/web && npm run test && npm run build && npm run lint
- Line-count audit: no tracked source file > 250 lines.
- Secrets audit: no keys/tokens in tracked files; .env.example only.
- Manual E2E: create a strong case -> APPROVE; create a weak case -> REFER/REJECT;
  trigger + resolve a document exception; confirm event timeline + audit trail;
  confirm both human gates fire; confirm dark/light parity on all 10 screens.
- Confirm the app still runs with zero external API keys (full mock mode).

REPORTING FORMAT (end your run with exactly this)
DONE:
- <bullet list of milestones completed and key files touched>
BLOCKED:
- <items requiring the human: UiPath Labs build, demo video, deck publish, Devpost submit>
RISK:
- <ambiguous calls you made, anything a reviewer should double-check>
NEXT:
- <ordered list of the human-gated steps to reach final submission>
```

