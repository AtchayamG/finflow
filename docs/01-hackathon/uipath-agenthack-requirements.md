# UiPath AgentHack Requirements

Last checked: 2026-06-14

Official source pages:
- Challenge overview: https://uipath-agenthack.devpost.com/
- Official rules: https://uipath-agenthack.devpost.com/rules
- Resources: https://uipath-agenthack.devpost.com/resources
- Tracks: https://uipath-agenthack.devpost.com/details/tracks

## Status

| Item | Status | Owner | Evidence |
|---|---|---|---|
| Devpost account logged in | PASS | Codex | Browser shows `atchayamganesh` account menu |
| Devpost hackathon registration | BLOCKED | User | Registration form asks for eligibility and rules/terms acknowledgements |
| Eligibility confirmation | BLOCKED | User | User must confirm legal age, country/residence eligibility, and no conflict |
| UiPath Labs access form | TODO | User/Codex | Required before Automation Cloud build; access may take 3 business days |
| Project coding start | BLOCKED | Codex | User instructed no coding until explicit approval |

## Dates

| Event | Official date |
|---|---|
| Registration and submission period | May 15, 2026 12:00 AM EDT to June 29, 2026 11:45 PM EDT |
| Deadline in local IST display | June 30, 2026 9:15 AM IST |
| Feedback period | May 15, 2026 12:00 PM EDT to July 2, 2026 11:45 PM EDT |
| Judging and finalist selection | June 3, 2026 10:00 AM EDT to July 14, 2026 11:45 PM EDT |
| Finalist presentation | Around July 23, 2026 |
| Public community voting | July 3, 2026 10:00 AM EDT to July 30, 2026 11:45 PM EDT |
| Winners announced | Around August 4, 2026 3:00 PM EDT |

## Eligibility Notes

- Open to individuals at least the age of majority where they reside.
- Teams may have up to 4 eligible individuals.
- The rules exclude residents or entities from restricted jurisdictions and standard sanctions exceptions, including Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, Sudan, Syria, and other restricted regions or entities.
- Team representative must be authorized to submit on behalf of the team.
- UiPath may require verification, tax, banking, or affidavit paperwork for winners.

## Build Requirements

- Build a new working software application during the submission period.
- The solution must use the UiPath Platform as the execution, orchestration, and governance layer.
- All solutions must run on UiPath Automation Cloud.
- Allowed components include Agent Builder, Maestro, API Workflows, coded agents, RPA, external agent frameworks, and LLMs.
- UiPath for Coding Agents usage can earn bonus points if documented with evidence.

## Track Fit

Primary target: Track 1, UiPath Maestro Case.

Why FinFlow fits:
- Loan and credit review is dynamic and exception-heavy.
- Cases move through stages with changing evidence and exceptions.
- Human decision points are natural and legally important.
- UiPath Maestro Case can show stages, ownership, auditability, escalation, and human-in-the-loop control.

Track 2 BPMN is a fallback only if Maestro Case access is unavailable and BPMN is easier to demonstrate in Labs.

## Submission Package

Required:
- Devpost project page with title, selected track, written description, screenshots or images.
- Demo video of no more than 5 minutes, publicly visible on YouTube, Vimeo, or Youku.
- Public GitHub repository with all project files needed to understand and run the solution.
- MIT or Apache 2.0 license visible in the repository.
- README with project description, UiPath components, agent type, prerequisites, and setup instructions.
- Working solution on UiPath Automation Cloud, with demo video showing it running on the platform.
- Completed presentation deck linked from the submission.

Optional:
- Product feedback form for Best Product Feedback award.
- Finalists may need to publish a UiPath Community Forum use case.

## Judging Criteria

Phase 1 base score: 5 criteria, each 1 to 5 points, maximum 25.

- Business Impact and Adoption Potential
- Platform Usage
- Technical Execution, Feasibility, and Versatility
- Completeness of Delivery
- Creativity and Innovation

Coding agent bonus:
- Up to 2 additional points.
- Evidence may include prompt logs, session export, screenshots, README section, or equivalent verification.
- README or Devpost must name the coding agents used and describe how they contributed.

## Corrections To Imported Docs

- Imported README says prize pool is `$48,000`; live Devpost says `$50,000 in cash`.
- Imported docs target a 3 minute demo. Official maximum is 5 minutes, but keeping the demo around 3 minutes is still a good strategy.
- Imported docs mention Claude Fable as final owner. For this workspace, Codex is CTO/project owner unless the user explicitly hands review to Claude or another agent.
