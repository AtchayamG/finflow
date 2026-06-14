# Prior Hackathon Lessons

Sources reviewed:
- `D:\Work\Codex\Hackathon Projects\Slack Agent`
- `D:\Work\Codex\Hackathon Projects\orbit-impact-guardian`
- `D:\Work\Codex\Hackathon Projects\AI Agent on Qwen Cloud`

## What To Reuse

| Pattern | Source | FinFlow Application |
|---|---|---|
| Preserve imported zip docs unchanged | Slack Agent, Qwen Cloud | Imported FinFlow docs stored under `docs/00-imported/original-zip-docs/` |
| Evidence checklist from day zero | Slack Agent | Track Devpost, UiPath Labs, public repo, license, video, deck, and platform proof |
| Codex as final integrator | Orbit, Qwen Cloud | Codex owns architecture, truthfulness, review, and final readiness |
| Bounded worker tasks | Orbit, Qwen Cloud | Hermes/Antigravity get scoped files and acceptance criteria |
| Demo mode without secrets | Slack Agent, Orbit, Qwen Cloud | FinFlow must run locally with mock bureau, KYC, and UiPath callbacks |
| Public artifact verification | Slack Agent | Logged-out GitHub check, public video check, link opening checks |
| Final submit left to user | Slack Agent | Devpost final certification and submit remain human-controlled |
| Source-of-truth docs before code | Qwen Cloud | Requirements, blueprint, architecture, contracts, and coordination plan first |
| Real platform proof separated from mock proof | Orbit, Qwen Cloud | UiPath Automation Cloud evidence must be distinct from local mock demo |

## What To Avoid

- Do not build a polished UI before the required UiPath flow is viable.
- Do not bury blockers in optimistic README language.
- Do not let worker agents change architecture or public claims.
- Do not claim platform deployment before screenshots, logs, or smoke checks exist.
- Do not expose personal emails, private keys, judge addresses, or account details in public docs.
- Do not rely on final video alone; keep repo artifacts inspectable.

## FinFlow-Specific Implications

- The first real risk is not backend code. It is UiPath Labs access and Maestro Case availability.
- The business story is strong because loan operations naturally require human approval, auditability, exceptions, and compliance.
- The MVP should prove one full loan case and one exception case, rather than many partial workflows.
- Track 1 is the best fit unless Labs lacks Maestro Case access.
- Coding agent bonus should be prepared with evidence from Codex, Hermes, and Antigravity logs.
