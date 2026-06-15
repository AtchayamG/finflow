# FinFlow Exception Rules

| Exception | Severity | Stage | Handling |
|---|---|---|---|
| `missing_document` | HUMAN_REQUIRED | document_review | Action Center document task |
| `low_confidence_extraction` | HUMAN_REQUIRED | document_review | Officer confirms synthetic fields |
| `bureau_api_failure` | AUTO_RESOLVABLE | credit | Retry through backend queue |
| `watchlist_match` | CRITICAL | compliance | Block case and escalate |
| `kyc_mismatch` | HUMAN_REQUIRED | compliance | Request resubmission |
| `policy_breach` | HUMAN_REQUIRED | decision | Refer to officer or committee |
| `document_fraud_signal` | CRITICAL | document_review | Senior escalation |

The local MVP classifies these through `ExceptionHandler` logic and persists the
records in the case audit trail.
