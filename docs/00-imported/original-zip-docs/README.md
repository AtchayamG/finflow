# FinFlow — UiPath AgentHack 2026
### Track 1: UiPath Maestro Case | AI-Powered Loan & Credit Case Management

---

## What Is FinFlow?

FinFlow is a production-ready **agentic case management system** for banking and
lending operations, built on UiPath Automation Cloud. It orchestrates the complete
loan/credit application lifecycle — from intake to disbursement — using a fleet of
AI agents coordinated by UiPath Maestro Case, with human-in-the-loop gates at
every critical decision point.

A bank operations team member submits a loan application. FinFlow's Maestro Case
engine opens a case, routes it through AI-powered stages (document extraction,
credit analysis, risk scoring, compliance check, approval), resolves exceptions
automatically, and only escalates genuine edge cases to humans — cutting processing
time from days to minutes.

---

## Hackathon Target

| Field | Value |
|---|---|
| Hackathon | UiPath AgentHack 2026 |
| Track | Track 1: UiPath Maestro Case |
| Prize pool | $48,000 across 16 awards |
| Grand prize | $8,000 |
| Track winner | $5,000 |
| Submission deadline | June 29, 2026 @ 11:45 PM EDT |
| Winners announced | August 4, 2026 |
| Devpost | uipath-agenthack.devpost.com |

---

## Why Track 1 (Maestro Case)?

Track 1 rewards exactly what FinFlow demonstrates:
- Dynamic, exception-heavy business processes ✅
- Multiple case stages with clear handoffs ✅
- AI agents + RPA robots + human approvers working together ✅
- Human-in-the-loop at critical decision points ✅
- Real enterprise domain (fintech/banking) ✅

The loan processing domain is explicitly mentioned in the track description as a
target scenario, and Atchayam's 13+ years in banking fintech (BHIM KVB UPay, TMB
MWallet, Equitas FASTag, Kotak FASTag Agent) gives domain depth no generic
submission can match.

---

## Judging Criteria Alignment

| Criterion | How FinFlow Wins |
|---|---|
| Agentic orchestration & innovation | Maestro Case with 5 AI agents + RPA |
| Business impact | Loan TAT: days → minutes, measurable ROI |
| Technical implementation | LangChain agents + UiPath native + coding agent |
| Completeness | End-to-end working solution, not a demo slide |
| Presentation | Demo video showing live case flow + metrics dashboard |

---

## The Five Case Stages

```
STAGE 1: INTAKE        → Document Agent extracts KYC, income proof, application
STAGE 2: VERIFICATION  → RPA Robot validates documents against bank systems
STAGE 3: CREDIT SCORE  → Credit Analysis Agent scores risk + bureau pull
STAGE 4: COMPLIANCE    → Compliance Agent checks AML/KYC/RBI guidelines
STAGE 5: DECISION      → Decision Agent recommends; Human Approver finalises
```

---

## AI Agents in FinFlow

| Agent | Built With | Role |
|---|---|---|
| **DocuMind** | UiPath Agent Builder | Document extraction & OCR classification |
| **CreditSage** | LangChain + UiPath | Credit risk scoring & bureau analysis |
| **ComplianceGuard** | UiPath Agent Builder | AML/KYC/regulatory compliance check |
| **DecisionPilot** | LangChain + UiPath | Final recommendation with explainability |
| **ExceptionHandler** | UiPath native | Detects + resolves case exceptions |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Case orchestration | UiPath Maestro Case |
| AI agents (native) | UiPath Agent Builder |
| AI agents (external) | LangChain (Python) via UiPath integration |
| RPA automation | UiPath Studio / Coded Workflows |
| Document AI | UiPath Document Understanding |
| Human task UI | UiPath Apps (Action Center) |
| Backend API | FastAPI (Python) |
| Database | PostgreSQL (case data) + Redis (session) |
| Coding agent used | Claude Code / Codex |
| Platform | UiPath Automation Cloud (Labs environment) |

---

## Owner / Quality Gate

**Claude Fable** is the final owner and QA gate. No file merges to `main` without
a sign-off entry in `REVIEW_LOG.md`. Claude Fable also owns the final submission
package review (demo video, Devpost text, architecture diagram).

---

## Repository Structure

```
finflow/
├── README.md
├── ARCHITECTURE.md
├── TASK_LIST.md
├── AGENT_CONTRACTS.md
├── REVIEW_LOG.md
├── ENVIRONMENT_SETUP.md
│
├── uipath/
│   ├── maestro/
│   │   ├── case_definition/     # Maestro Case stages + transitions
│   │   └── action_center/       # Human task forms (UiPath Apps)
│   ├── agents/
│   │   ├── documind/            # DocuMind agent (UiPath Agent Builder)
│   │   ├── complianceguard/     # ComplianceGuard agent
│   │   └── exceptionhandler/    # Exception resolution automation
│   └── rpa/
│       └── document_validator/  # RPA robot for doc verification
│
├── backend/
│   ├── agents/
│   │   ├── creditsage/          # CreditSage LangChain agent
│   │   └── decisionpilot/       # DecisionPilot LangChain agent
│   ├── api/                     # FastAPI gateway
│   ├── models/                  # Pydantic data models
│   ├── services/                # Business logic services
│   └── utils/                   # Shared utilities
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/
    ├── architecture_diagram.png
    ├── demo_script/
    └── submission/
```

---

## File Limits

> **Every source file ≤ 250 lines.** Split at logical boundaries if approaching
> limit. Enforced by Claude Fable during review. No exceptions.

---

## Quick Start for Agents (Codex / Antigravity / Hermes)

1. Read `ARCHITECTURE.md` — full system design
2. Read `AGENT_CONTRACTS.md` — all input/output schemas
3. Read `TASK_LIST.md` — pick your assigned phase
4. Read your `agents/AGENT_BRIEF_*.md` — your specific instructions
5. Build. Keep every file ≤ 250 lines. Write tests alongside code.
6. Update `REVIEW_LOG.md` with completed tasks
7. Claude Fable reviews everything before merge
