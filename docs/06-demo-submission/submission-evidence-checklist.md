# Submission Evidence Checklist

Use this checklist before any coding claim, public claim, or Devpost submit.

| Requirement | Evidence | Status | Owner | Verification |
|---|---|---|---|---|
| User eligible by age, residence, sanctions, employment, and conflicts | User confirmation plus official rules link | PASS | User | User confirmed solo developer from India, age 37, not currently working in an organisation |
| Devpost registration | Devpost manager page shows "Thanks for registering!" | PASS | Codex/User | Completed 2026-06-14 after user confirmed eligibility and terms |
| Devpost project draft | Draft `1051319-finflow` | PASS | Codex | Project overview, details, media, and additional info saved; 4/5 steps done |
| UiPath Labs access requested | Access form confirmation or email | TODO | User | Draft ready in `docs/09-planning/uipath-labs-access-request.md`; user submits the human-gated form |
| UiPath Labs access received | Email or Automation Cloud tenant dashboard | TODO | User/Codex | Login and screenshot dashboard, no secrets |
| Maestro Case available | Automation Cloud Labs screen or docs | TODO | Codex | Manual check in tenant |
| Public GitHub repo | https://github.com/AtchayamG/finflow | PASS | Codex | HTTP 200 and `git ls-remote` verified |
| License visible | `LICENSE` | PASS | Codex | MIT license committed |
| README quickstart | `README.md` | PASS | Codex | Backend/frontend/test commands documented |
| UiPath components listed | README, Devpost draft, and `uipath/README.md` | PASS | Codex | Matches simulated client plus import-ready artifacts |
| Coding agent evidence | README section and `docs/04-agents/` logs | PASS | Codex | Codex work verified; Hermes/Antigravity limits disclosed |
| Local demo mode works without secrets | Backend and frontend local smoke | PASS | Codex | Tests cover approve, refer, reject, exception, analytics, webhook auth |
| UiPath platform proof | Screenshots/logs/video of Automation Cloud run | TODO | Codex/User | Same view judges can understand |
| Demo video under 5 minutes | https://youtu.be/NtKwIzjGJ3E and `assets/submission/finflow-demo.mp4` | PASS | Codex | Published on YouTube; local ffprobe duration 58.97 seconds |
| Presentation deck | https://github.com/AtchayamG/finflow/raw/main/assets/submission/finflow-pitch-deck.pdf | PASS | Codex | Public GitHub raw PDF link used in Devpost additional info |
| Devpost draft truthful | `docs/06-demo-submission/devpost-submission-draft.md` | PASS | Codex | Uses TODO/BLOCKED for unverified links and UiPath proof |
| Docker and CI definitions | `infra/docker/`, `.github/workflows/ci.yml` | PASS | Codex | `docker compose config` and local commands verify syntax |
| Final Devpost submit | Devpost confirmation | BLOCKED | User/Codex | Final page reached, but submit requires truthful UiPath Platform execution proof; current evidence remains simulated/import-ready only |

## Current Browser Finding

As of 2026-06-15, Devpost registration is complete under account `atchayamganesh`.
The project draft is:

- Draft: `1051319-finflow`
- Preview slug: `/software/finflow-e57qmy`
- Saved overview: `FinFlow`
- Status: draft, `4/5` steps done
- Public demo video: https://youtu.be/NtKwIzjGJ3E
- Public deck: https://github.com/AtchayamG/finflow/raw/main/assets/submission/finflow-pitch-deck.pdf
- Project gallery: submission screenshots uploaded from `assets/submission/`

Remaining Devpost work is final submission review after live UiPath Automation
Cloud/Labs execution evidence is available. Do not click final submit while the
only available UiPath proof is the simulated client plus import-ready artifacts.
