# FinFlow Gap Analysis & Remediation Plan

Date: 2026-06-15
Reviewer: Claude (Cowork review pass)
Scope: full repo review of `services/api`, `apps/web`, `docs/`, and the
`finflow-ui-ux-reference/` pack, measured against the hackathon requirements
(`docs/01-hackathon/uipath-agenthack-requirements.md`), the product blueprint
(`docs/02-product/blueprint.md`), and the agent contracts
(`docs/00-imported/original-zip-docs/AGENT_CONTRACTS.md`).

This document is the single source of truth for the autonomous completion pass.
The companion file `CODEX-AUTONOMOUS-COMPLETION-PROMPT.md` is the prompt to paste
into Codex; it executes the work defined here.

---

## 1. Verdict

What exists today is a clean, honest, but **thin** slice: a deterministic FastAPI
workflow, a single-button frontend over static demo data, a strong design
reference pack, and well-organised planning docs. It demonstrates the *shape* of
the product but does not yet deliver the depth the reference pack and the
judging criteria reward.

The biggest risks to the submission are:

1. **Claims-vs-reality drift.** The docs describe 5 agents, UiPath Maestro,
   Action Center, a DB, and CI. The code contains none of those. The README is
   honest about this, but the gap is large.
2. **UI fidelity.** Only the Login screen closely matches the reference pack;
   the other nine screens are simplified placeholders.
3. **The frontend is not actually wired to the backend** beyond one demo button.

None of this is fatal. With a focused completion pass, everything that can be
built without live UiPath Labs access can be made real, deep, and demo-ready.

---

## 2. Who built what (for the record)

Per `docs/04-agents/cto-operating-model.md`, Codex / Hermes / Antigravity are
**peer agents under a delegation model**, not "Codex using Hermes":

- **Codex** — CTO, backend + infrastructure + integration + final review.
- **Hermes** — low-cost worker for docs, demo script, submission text, QA.
- **Antigravity** — UI polish and the AI-agent implementations.
- **User (Atchayam)** — legal/account owner: eligibility, UiPath Labs access,
  final Devpost submit.

Git history shows a single human author across 3 commits, so the division of
labour is documented intent only — not verifiable from the repo.

---

## 3. Prioritized gaps

### P0 — Correctness & truthfulness (must fix before any wider claim)

| # | Gap | Evidence | Fix |
|---|---|---|---|
| P0-1 | No real UiPath integration anywhere | `grep -i uipath services/api/app` returns nothing | Add a `UiPathClient` adapter interface + a `SimulatedUiPathClient` implementation. Keep clearly labeled "simulated" until Labs proof exists. Author all exportable UiPath config artifacts (Maestro case JSON, Action Center form JSON, agent definition JSON). |
| P0-2 | Documented agents don't exist; credit is hardcoded | `_run_credit` sets `bureau_score = 762`; compliance always `passed: True`; decision confidence hardcoded `0.87` | Build the agent layer (mock-mode + optional LLM) matching `AGENT_CONTRACTS.md`. Bureau data and compliance must vary by applicant input so non-demo cases produce REFER/REJECT. |
| P0-3 | Webhook auth declared but not implemented | `FINFLOW_WEBHOOK_TOKEN` in `.env.example` but never read | Enforce a shared-secret header on all `/webhooks/*` routes; return 401 when missing/wrong; keep mock-mode override for local demo. |
| P0-4 | Settings screen claims "Webhook protection: demo token" while none exists | `App.tsx` SettingsView | Make the claim true once P0-3 lands, or label as "simulated". |

### P1 — Functionality (the product must actually work end to end)

| # | Gap | Evidence | Fix |
|---|---|---|---|
| P1-1 | Frontend is static except one button | only `runE2EDemo` calls the API; no `useEffect`, no list fetch | Wire every screen to live backend data: list cases, create case, open case, run steps, submit human decisions, poll status, render real event timeline + exceptions + analytics. |
| P1-2 | Case rows are not clickable | `selected = cases[0]` | Add selection state; clicking a row opens that case's details/decision. |
| P1-3 | Login is cosmetic | any click on "Secure access" logs in; inputs unwired | Add a demo-credential gate (env-config, no real secret), basic validation, and a clear "demo login" note. |
| P1-4 | No persistence | `InMemoryStore` | Add SQLite-backed store by default (file in repo-ignored path), Postgres optional via `DATABASE_URL`. Keep in-memory as a test mode. |
| P1-5 | `document_review` stage missing from frontend pipeline | `stageSequence` omits it; case FF-2026-002 never highlights | Reconcile the stage model end to end; pipeline must reflect every backend stage including exception/document_review. |

### P2 — UI fidelity to the reference pack

Reference screens are dense, enterprise dashboards. Current build reproduces the
theme/layout language but not the content. Required uplifts:

- **Dashboard:** metric cards + multi-column case pipeline table + SLA-risk donut
  + agent activity feed + approval queue + exceptions heatmap + case-insights panel.
- **Document review:** flagged-doc list + synthetic document viewer + extracted-data
  fields with confidence meter + structured review-decision panel.
- **Decision:** credit gauge + risk panel + compliance panel + policy checklist +
  AI recommendation with confidence + approved-amount field + documents-considered
  table + audit timeline.
- **Cases / Case-details / Exceptions / Analytics / Settings / Profile:** raise to
  reference density; charts via a lightweight lib (Recharts or hand-rolled SVG).
- **Dark/light parity** must be maintained on every screen.
- Keep all data **synthetic**; do **not** reproduce the realistic Aadhaar replica
  shown in `document-review.png` — the reference pack's own rules forbid identity
  replicas, so the current synthetic placeholder approach is correct and must stay.

### P3 — Infrastructure, tests, submission readiness

- Dockerfile + `docker-compose.yml` (api + web + optional postgres) — Phase 11.
- GitHub Actions CI: lint + pytest + vitest + web build on every push/PR.
- Test coverage for the missing branches: final-decision **reject** and **refer**,
  document-review **blocked/resubmission/escalate**, webhook auth failure,
  policy violations producing REFER/REJECT, and at least one frontend render test.
- Refresh submission docs truthfully: README UiPath-components section, Devpost
  draft, evidence checklist, demo script (≤5 min, ~3 min target), architecture
  diagram, and a presentation-deck outline.
- Add a **Coding Agents Used** section (Codex/Hermes/Antigravity, how each
  contributed) — worth up to 2 bonus points if documented with evidence.

---

## 4. What stays the same (already good)

- `services/api/app/policy.py` credit/DTI/policy math — clean and well tested.
- The workflow state machine is coherent; keep its shape, deepen its inputs.
- File sizes are small and readable (the ≤250-line rule is being honoured).
- README honesty about mock/simulated boundaries — preserve this tone everywhere.
- The design system (CSS variables, dark/light tokens) is a solid foundation.

---

## 5. Hard constraints the completion pass must respect

These come from the operating model's stop conditions and the hackathon rules,
and they bound what an autonomous agent may do:

1. **No fabricated UiPath proof.** Codex cannot reach UiPath Automation Cloud /
   Labs (access is human-gated and pending). It must build everything offline and
   label the UiPath client "simulated" until the user supplies real Labs evidence.
2. **No auto-submit to Devpost.** Final legal submission is the user's action.
3. **No claims of a demo video, live CIBIL/PAN/Aadhaar/AML, or deployed-on-cloud**
   until evidence exists.
4. **No secrets committed.** Env-only; mock modes must run with zero keys.
5. **Every file ≤ 250 lines; Pydantic contracts from `AGENT_CONTRACTS.md`.**
6. **Truthfulness language** from `blueprint.md` §"Truthfulness Language".

---

## 6. Human-gated tail (cannot be automated)

After Codex finishes, these remain for the user:

1. Submit the UiPath Labs access form and, once granted, build the Maestro Case +
   Action Center forms in the tenant using the exported configs Codex produced.
2. Record the ≤5-minute demo video and upload it (YouTube/Vimeo, public).
3. Publish the presentation deck (public link).
4. Paste final text into the Devpost project page and click **Submit**
   (deadline: June 29, 2026, 11:45 PM EDT).

Submission link:
https://devpost.com/submit-to/29624-uipath-agenthack/manage/submissions/1051319-finflow/project_details/edit
