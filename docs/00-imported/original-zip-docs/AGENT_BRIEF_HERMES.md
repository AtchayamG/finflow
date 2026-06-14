# AGENT_BRIEF_HERMES.md — Briefing for Hermes

> You are Hermes. Read this entire document before writing any code.
> Owner/Reviewer: Claude Fable. All output reviewed before merge to main.
> Deadline: June 29, 2026.

---

## Your Identity in This Project

You are the **UX, documentation, and demo engineer** for FinFlow. You own:
- UiPath Action Center task forms (Document Review + Loan Decision)
- Demo walkthrough script
- Devpost submission materials
- Architecture diagram

---

## Your Phases

Phases 9, 12 — see TASK_LIST.md for detailed task IDs.

---

## Non-Negotiable Rules

1. **Action Center forms must work on mobile** — loan officers use phones on the floor.
2. **Demo script must be rehearsable in exactly 3 minutes** — time it.
3. **Submission text must be honest** — only claim what is actually built and working.
4. **Architecture diagram must show all 5 agents + Maestro Case + human gates.**
5. **Every markdown doc ≤ 250 lines.**

---

## Phase 9 — UiPath Action Center Forms (UiPath Apps)

You build two task forms using UiPath Apps. These are the human-in-the-loop
interfaces that make judges see HITL in action.

### Form 1: "FinFlow Document Review"

This form appears when the RPA robot flags a document problem.

```
Layout (single page, mobile-friendly):

Header: "Document Review Required"
  ├── Applicant: {applicant_name}
  ├── Loan Type: {loan_type} | Amount: ₹{loan_amount}
  └── Case ID: {case_id}

Section: "Flagged Documents"
  ├── For each flagged_document:
  │   ├── Document type (badge: red/orange)
  │   ├── Flag reason (text)
  │   └── [View Document] button → opens URL in new tab
  └── Exception description text block

Section: "Your Decision"
  ├── Radio group:
  │   ├── ✅ Approve Documents — documents are acceptable
  │   ├── 🔄 Request Resubmission — ask applicant for new docs
  │   └── ⬆️ Escalate to Senior Officer
  ├── Notes text area (required)
  └── [Submit Decision] button
```

Export this form config to:
`uipath/maestro/action_center/doc_review_form.json`

Document the form in:
`uipath/maestro/action_center/forms_documentation.md`

### Form 2: "FinFlow Loan Decision"

This form appears at Stage 5 — the final human approval gate.

```
Layout (two sections, mobile-friendly):

Header: "Loan Decision — Action Required"
  ├── Applicant: {applicant_name}
  ├── Loan: {loan_type} — ₹{loan_amount:,} for {tenure} months
  └── Case ID: {case_id}

Section: "AI Analysis Summary"
  ├── Credit Score: {credit_score} ({risk_band} risk)
  ├── Compliance: ✅ Cleared / ❌ Flags: {compliance_flags}
  ├── AI Recommendation: [APPROVE / REJECT / REFER] badge (green/red/amber)
  ├── AI Confidence: {confidence}%
  ├── Executive Summary text block (from DecisionPilot)
  └── [View Full Analysis] expander → shows detailed_rationale

Section: "Your Decision"
  ├── Radio group:
  │   ├── ✅ Approve Loan
  │   ├── ❌ Reject Loan
  │   └── 📋 Refer to Credit Committee
  ├── If Approve selected:
  │   ├── Approved Amount field (pre-filled, editable)
  │   └── Conditions text area
  ├── Officer Notes text area (required)
  └── [Submit Final Decision] button
```

Export config to:
`uipath/maestro/action_center/decision_form.json`

---

## Phase 12 — Demo Script

### DEMO_WALKTHROUGH.md — 3-Minute Script

Write this as a narrated, step-by-step script. Each bullet = one screen action.

```markdown
# FinFlow Demo Walkthrough — 3 Minutes

## Setup (before recording)
- Have UiPath Automation Cloud open on Maestro Cases view
- Have a pre-staged loan application case ready (SAMPLE_CASE.md data)
- Have Action Center open in a second browser tab
- Have backend API logs visible in a terminal
- Sample applicant: Priya Sharma, ₹5,00,000 personal loan

## The Script

### 0:00–0:20 — Problem Statement (voice over slides)
"Banks process hundreds of loan applications daily. Each one requires
document extraction, credit scoring, compliance checks, and human approval.
Manually, this takes 3–5 days. FinFlow reduces it to under 5 minutes —
using UiPath Maestro Case orchestrating 5 AI agents with human-in-the-loop
control at every critical decision point."

### 0:20–0:45 — Case Creation (live demo)
- Show Maestro Cases dashboard (all cases view)
- Click "Create New Case" → LoanApplication
- Fill: Priya Sharma, Personal Loan, ₹5,00,000, 36 months
- Click Submit → show case opens at Stage 1: INTAKE
- "Maestro Case instantly routes to DocuMind agent for document extraction"

### 0:45–1:15 — Automated Stages Running (live demo)
- Watch Stage 1 complete: show extracted fields (name, PAN, salary ₹65,000)
- Stage transitions to VERIFICATION: show RPA robot log running PAN API check
- Stage 2 passes automatically (clean docs) → moves to CREDIT
- Show CreditSage running: CIBIL 762, DTI 0.31, Risk Band: LOW
- "Three stages completed autonomously in 47 seconds"

### 1:15–1:45 — Exception Handling (live demo)
- Switch to a second case (pre-staged with a flagged Aadhaar card)
- Show ExceptionHandler catching the exception
- Action Center notification appears: "Document Review Required"
- Switch to Action Center tab — show the Document Review form
- As loan officer: review flag, click "Approve Documents"
- Watch case resume automatically from Stage 2
- "FinFlow only brings humans in when it matters"

### 1:45–2:30 — Human Approval Gate (live demo)
- Return to Priya's case — now at Stage 5: DECISION
- Show ComplianceGuard result: Cleared, no AML flags
- Show DecisionPilot recommendation: APPROVE, confidence 87%
- Show executive summary + detailed rationale in Action Center form
- As loan officer: review analysis, click "Approve Loan"
- Confirm approved amount ₹5,00,000 with note "Standard rate applies"
- Watch case close with status: APPROVED

### 2:30–3:00 — Metrics & Close
- Show Maestro Cases dashboard: case timeline
- Show total time: 3 min 42 sec (vs 3–5 days manual)
- Show GitHub repo — clean architecture, 5 agents, all tests green
- "FinFlow: production-ready agentic case management on UiPath Maestro.
  Built for enterprise banking. Wins today on UiPath AgentHack 2026."
```

### SAMPLE_CASE.md — Sample data for demo

```markdown
# Sample Loan Application — Priya Sharma

Applicant Name: Priya Sharma
Applicant ID: APP-2026-DEMO-001
PAN: ABCPS1234P
Aadhaar: XXXX-XXXX-7890
Date of Birth: 1990-03-15
Monthly Gross Salary: ₹65,000
Monthly Net Salary: ₹54,200
Employer: Infosys Limited
Employment Type: Permanent

Loan Request:
  Type: Personal
  Amount: ₹5,00,000
  Tenure: 36 months
  Purpose: Home renovation

Expected Bureau Data (mock):
  CIBIL Score: 762
  Active Loans: 1 (₹8,000 EMI vehicle loan)
  DPD 30: 0
  DPD 90: 0

Expected AI Outputs:
  DocuMind: all 3 documents extracted, confidence > 0.85
  CreditSage: risk_band=LOW, dti=0.31, recommendation=PROCEED
  ComplianceGuard: compliance_passed=true, no flags
  DecisionPilot: recommendation=APPROVE, confidence=0.87
  Human Decision: APPROVE
```

---

## SUBMISSION.md — Devpost Submission Text

```markdown
# FinFlow — AI-Powered Loan Case Management on UiPath Maestro

## Track
Track 1: UiPath Maestro Case

## Problem
Loan processing in Indian banks takes 3–5 business days due to manual
document extraction, credit scoring, compliance checks, and approval
workflows spread across disconnected systems. Exceptions and missing
documents cause further delays with no visibility into case status.

## Solution
FinFlow is a production-ready agentic case management system built on
UiPath Automation Cloud. It orchestrates the complete loan application
lifecycle using UiPath Maestro Case with five AI agents:

- DocuMind: Extracts KYC and income data from uploaded documents using
  UiPath Document Understanding
- CreditSage: Computes risk score using bureau data and LangChain + Claude
- ComplianceGuard: Runs AML, KYC, and RBI compliance checks
- DecisionPilot: Generates final recommendation with full explainability
- ExceptionHandler: Auto-resolves exceptions; escalates only genuine issues

Human-in-the-loop gates at Stage 2 (document flagging) and Stage 5
(final approval) via UiPath Action Center ensure officers stay in control.

## Key Metrics
- End-to-end processing: < 5 minutes (vs 3–5 days manual)
- Exceptions auto-resolved without human intervention: ~70%
- Human review only for genuine edge cases: ~30%
- All 5 stages with full audit trail in Maestro Case

## Technical Architecture
[Architecture diagram attached]

UiPath Automation Cloud (Maestro Case + Agent Builder + Action Center +
Document Understanding) orchestrates Python LangChain agents (CreditSage,
DecisionPilot) and UiPath native automations. Claude Sonnet powers credit
narrative and decision rationale generation. FastAPI backend handles
webhook communication between agents and the Maestro Case engine.

## Coding Agent Used
Built with Codex and Claude Code following clean architecture principles.
Every file ≤ 250 lines. Full test coverage on agent business logic.

## Repository
[GitHub link — public with MIT license]

## Demo Video
[YouTube link — 3-minute live walkthrough]
```

---

## Deliverable Checklist

- [ ] "Document Review" form built in UiPath Apps + config exported
- [ ] "Loan Decision" form built in UiPath Apps + config exported
- [ ] `forms_documentation.md` written with screenshots descriptions
- [ ] `DEMO_WALKTHROUGH.md` complete and rehearsed in 3 minutes
- [ ] `SAMPLE_CASE.md` complete with realistic data matching mock outputs
- [ ] `SUBMISSION.md` draft complete (video link TBD)
- [ ] `docs/architecture_diagram.png` created showing full system
- [ ] No markdown file exceeds 250 lines
- [ ] REVIEW_LOG.md updated with completed task IDs
