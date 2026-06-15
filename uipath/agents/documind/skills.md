# DocuMind Skills

| Skill | Input | Output |
|---|---|---|
| Document classification | Signed synthetic URLs | Document type |
| Field extraction | Synthetic document pages | Extracted fields with confidence |
| Validation | Expected doc types | Missing fields and pass/fail |
| Exception routing | Extraction confidence | Exception payload for Action Center |

Local implementation: `services/api/app/agents/documind.py`.
