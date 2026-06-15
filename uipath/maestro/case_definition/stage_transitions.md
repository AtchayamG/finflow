# FinFlow Stage Transitions

| From | To | Trigger | Notes |
|---|---|---|---|
| intake | document_review | DocuMind low confidence or missing doc | Creates Action Center document task |
| intake | verification | DocuMind success | No human document gate needed |
| document_review | verification | Officer `APPROVE_DOCS` | Resolves document exception |
| document_review | document_review | Officer `REQUEST_RESUBMIT` | Keeps case awaiting human input |
| document_review | exception | Officer `ESCALATE` | Senior review needed |
| verification | credit | Document validation complete | Updates Maestro case attribute |
| credit | compliance | CreditSage output accepted | Bureau data is mock provider data |
| compliance | decision | ComplianceGuard complete | Flags remain visible for officer |
| decision | closed | Officer approve/reject/refer | Records final audit event |

All local transitions are implemented in `services/api/app/workflow.py`.
