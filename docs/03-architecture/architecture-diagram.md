# FinFlow Architecture

```mermaid
flowchart LR
  UI["React UI\n10 screens, dark/light"] --> API["FastAPI backend\ncases, webhooks, analytics"]
  API --> Store["SQLite event store\ncases + audit trail"]
  API --> Uipath["Simulated UiPath client\nUiPath-ready boundary"]
  Uipath --> Maestro["Maestro Case specs\nimport-ready"]
  Uipath --> Action["Action Center forms\ndoc review + decision"]
  API --> Doc["DocuMind\nmock extraction"]
  API --> Credit["CreditSage\nmock bureau + scoring"]
  API --> Compliance["ComplianceGuard\nmock AML/KYC/RBI"]
  API --> Decision["DecisionPilot\npolicy recommendation"]
  API --> Exception["ExceptionHandler\nclassification"]
  Doc --> Action
  Decision --> Action
```

## Boundary

Local demo mode is fully runnable without external API keys. UiPath platform
execution remains blocked until Labs access is granted. The `uipath/` artifacts
are import-ready specs, not live tenant evidence.

## Human Gates

- Document review: resolves low-confidence synthetic extraction.
- Final decision: officer approves, rejects, or refers the loan.
