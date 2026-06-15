# ComplianceGuard Skills

| Skill | Input | Output |
|---|---|---|
| AML screening | Applicant name and nationality | Watchlist flag or clear |
| KYC consistency | PAN and masked Aadhaar | KYC mismatch flag or clear |
| RBI policy check | Loan amount and risk band | RBI limit flag or clear |
| Action routing | Flags and severity | Required actions |

Local implementation: `services/api/app/agents/complianceguard.py`.
