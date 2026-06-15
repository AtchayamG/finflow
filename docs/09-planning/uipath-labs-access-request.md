# UiPath Labs Access Request — FinFlow

Purpose: unblock the one item the autonomous build cannot reach — a live UiPath
Automation Cloud / Labs tenant — so the Maestro Case, Action Center forms, and
agents can be imported from the configs Codex produces and shown in the demo video.

Access form (from the planning docs): https://bit.ly/agenthack26form
> This is a human-gated action. Only the user (Atchayam) submits it, because it
> carries identity and eligibility confirmation. Codex maintains this draft; it
> does not submit it.

Status target: move `UiPath Labs access requested` from TODO to PASS in
`docs/06-demo-submission/submission-evidence-checklist.md` once submitted.
Note: access can take up to ~3 business days, so submit this first.

---

## 1. Ready-to-paste form answers

Use/adjust these for the access form fields. Keep them truthful; do not add data
the form does not ask for.

- Full name: Atchayam G
- Email: atchayamganesh@gmail.com
- Country / region: India
- Participation type: Solo developer (team of 1)
- Hackathon: UiPath AgentHack 2026
- Devpost project: FinFlow (draft `1051319-finflow`)
- Public repo: https://github.com/AtchayamG/finflow
- Selected track: Track 1 — UiPath Maestro Case
- Organization / company: Independent (not currently affiliated with an organization)

Project summary (one paragraph):
> FinFlow is an agentic loan-processing case workflow for retail banking. A loan
> application is modeled as a UiPath Maestro Case that moves through intake,
> document verification, credit assessment, compliance, and a final decision,
> with human-in-the-loop gates at document review and final approval via UiPath
> Action Center. It demonstrates exception handling, auditability, and explainable
> recommendations. A working local MVP and public repo already exist; we are
> requesting Labs access to run the Maestro Case and Action Center forms on
> UiPath Automation Cloud for the demo.

UiPath components requested / to be used:
- UiPath Maestro (Case Management) — orchestration + stage transitions + audit
- UiPath Agent Builder — DocuMind (document extraction), ComplianceGuard (AML/KYC/RBI)
- UiPath Action Center — Document Review + Loan Decision human task forms
- UiPath Document Understanding — KYC/income document extraction (synthetic samples)
- UiPath Orchestrator — assets, queues, process publishing (FinFlow_Production folder)

Why Labs access is needed (one line):
> To deploy and demonstrate the Maestro Case + Action Center workflow on UiPath
> Automation Cloud, as required by the submission rules.

Coding agents used (bonus-point disclosure, if the form asks):
> Codex (backend/infra/integration), plus a delegation model with Hermes (docs/QA)
> and Antigravity (UI/agents). Documented in docs/04-agents/.

---

## 2. Short cover note / email (if a free-text or email step exists)

> Subject: UiPath Labs access request — AgentHack 2026, Track 1 (FinFlow)
>
> Hello UiPath AgentHack team,
>
> I'm Atchayam G, a solo participant in UiPath AgentHack 2026 (registered on
> Devpost, project "FinFlow", Track 1 — UiPath Maestro Case). I'm requesting
> access to the UiPath Automation Cloud / Labs environment to build and
> demonstrate my solution.
>
> FinFlow models a bank loan application as a Maestro Case that flows through
> intake, document verification, credit, compliance, and a final decision, with
> human-in-the-loop approval gates in Action Center. I already have a working
> local MVP and a public repository, and I have prepared import-ready Maestro
> Case, Action Center, and Agent Builder configurations. I need a Labs tenant to
> deploy and record the platform demo required for submission.
>
> Public repo: https://github.com/AtchayamG/finflow
> Devpost project: FinFlow (draft 1051319-finflow)
>
> Thank you for considering my request — I'd appreciate access at the earliest,
> given the June 29 submission deadline.
>
> Best regards,
> Atchayam G
> atchayamganesh@gmail.com

---

## 3. After access is granted (human steps)

1. Log into UiPath Automation Cloud Labs; screenshot the dashboard (no secrets).
2. Create Orchestrator folder `FinFlow_Production`.
3. Import the Maestro Case from `uipath/maestro/case_definition/case_config.json`.
4. Build the two Action Center forms from
   `uipath/maestro/action_center/*.json` + `forms_documentation.md`.
5. Configure DocuMind + ComplianceGuard in Agent Builder from
   `uipath/agents/*/agent_definition.json`.
6. Point the backend `UIPATH_*` env vars at the tenant and swap
   `SimulatedUiPathClient` for the real client (config-only).
7. Run one case end to end on the platform and record it for the demo video.
8. Update the evidence checklist rows (Labs access, Maestro available, platform
   proof) from TODO to PASS with the screenshots/links as evidence.

Do not paste tenant URLs, tokens, or client secrets into the repo. Use env only.
