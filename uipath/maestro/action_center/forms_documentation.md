# Action Center Forms

The form JSON files mirror the Pydantic payloads in
`docs/00-imported/original-zip-docs/AGENT_CONTRACTS.md`.

## Document Review

Used when DocuMind returns `missing_document` or `low_confidence_extraction`.
The reviewer can approve corrected synthetic fields, request resubmission, or
escalate to the exception stage.

## Loan Decision

Used after DecisionPilot produces a deterministic recommendation. The officer
reviews mock credit, compliance flags, policy rationale, proposed conditions,
and records approve, reject, or refer.

Both forms should be built with compact mobile-friendly layouts: read-only
evidence first, reviewer notes near the action buttons, and no realistic identity
document replica.
