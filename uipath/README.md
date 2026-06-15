# FinFlow UiPath-Ready Artifacts

These files are offline-authored import specs for UiPath AgentHack Track 1.
They are not live-tenant proof. Use them after UiPath Labs access is granted.

## Import Map

| Folder | Purpose | Human import step |
|---|---|---|
| `maestro/case_definition/` | Maestro Case stages, transitions, exceptions | Recreate/import the FinFlow loan case in Maestro |
| `maestro/action_center/` | Document Review and Loan Decision form specs | Build Action Center forms with the same fields/buttons |
| `agents/documind/` | Agent Builder definition for document extraction | Configure DocuMind agent and callback |
| `agents/complianceguard/` | Agent Builder definition for compliance checks | Configure ComplianceGuard agent and callback |

## Truth Boundary

The current backend uses a simulated UiPath client and mock providers. Once Labs
access is available, set UiPath tenant credentials through environment variables
only and replace the simulated client behind the existing interface.
