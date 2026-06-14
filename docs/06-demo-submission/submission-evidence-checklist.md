# Submission Evidence Checklist

Use this checklist before any coding claim, public claim, or Devpost submit.

| Requirement | Evidence | Status | Owner | Verification |
|---|---|---|---|---|
| User eligible by age, residence, sanctions, employment, and conflicts | User confirmation plus official rules link | BLOCKED | User | Confirm before Devpost registration |
| Devpost registration | Devpost registered state or confirmation page | BLOCKED | Codex/User | Browser registration form currently paused |
| UiPath Labs access requested | Access form confirmation or email | TODO | User/Codex | Submit form after registration details are confirmed |
| UiPath Labs access received | Email or Automation Cloud tenant dashboard | TODO | User/Codex | Login and screenshot dashboard, no secrets |
| Maestro Case available | Automation Cloud Labs screen or docs | TODO | Codex | Manual check in tenant |
| Public GitHub repo | https://github.com/AtchayamG/finflow | PASS | Codex | HTTP 200 and `git ls-remote` verified |
| License visible | `LICENSE` | PASS | Codex | MIT license committed |
| README quickstart | `README.md` | PASS | Codex | Backend/frontend/test commands documented |
| UiPath components listed | README and Devpost text | TODO | Codex | Match actual build |
| Coding agent evidence | README section and `docs/04-agents/` logs | TODO | Codex | Include Codex/Hermes/Antigravity evidence |
| Local demo mode works without secrets | Backend and frontend local smoke | PASS | Codex | Browser E2E closed backend case as APPROVED |
| UiPath platform proof | Screenshots/logs/video of Automation Cloud run | TODO | Codex/User | Same view judges can understand |
| Demo video under 5 minutes | Public video URL and local file | TODO | User/Codex | Verify duration with tooling or platform |
| Presentation deck | Public viewable link | TODO | Hermes/Codex | Link opens without login |
| Devpost draft truthful | `docs/06-demo-submission/devpost-submission-draft.md` | PASS | Codex | Uses TODO/BLOCKED for unverified links and UiPath proof |
| Final Devpost submit | Devpost confirmation | TODO | User | User controls final legal submit |

## Current Browser Finding

As of 2026-06-14, Devpost registration page is open for UiPath AgentHack under account `atchayamganesh`. The page asks for:

- teammate status,
- referral source,
- free-text hackathon goal,
- acknowledgement of eligibility requirements,
- agreement to Official Rules and Devpost Terms of Service,
- Register button.

Codex stopped before selecting or submitting those acknowledgements.
