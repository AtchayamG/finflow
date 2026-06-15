from time import perf_counter

from app.contracts import AgentStatus, ComplianceFlag, ComplianceGuardInput, ComplianceGuardOutput
from app.logging_utils import log_event


def run_complianceguard(payload: ComplianceGuardInput) -> ComplianceGuardOutput:
    started = perf_counter()
    flags: list[ComplianceFlag] = []
    credit = payload.credit_score_result
    name = payload.applicant_name.lower()

    if any(marker in name for marker in ["watch", "sanction", "blocked"]):
        flags.append(_flag("AML_WATCHLIST", "CRITICAL", "Mock watchlist keyword matched.", "Senior compliance review."))
    if payload.aadhaar_number == "0000" or payload.pan_number.endswith("0000"):
        flags.append(_flag("KYC_MISMATCH", "HIGH", "Synthetic identity fields do not align.", "Request resubmission."))
    if payload.loan_amount > 2_000_000 and credit.risk_band in {"HIGH", "VERY_HIGH"}:
        flags.append(_flag("RBI_LIMIT", "MEDIUM", "High-risk exposure needs policy exception.", "Credit committee review."))

    aml_cleared = not any(flag.flag_type == "AML_WATCHLIST" for flag in flags)
    kyc_verified = not any(flag.flag_type == "KYC_MISMATCH" for flag in flags)
    rbi_norms_met = not any(flag.flag_type == "RBI_LIMIT" for flag in flags)
    output = ComplianceGuardOutput(
        case_id=payload.case_id,
        agent_status=AgentStatus.SUCCESS if not flags else AgentStatus.EXCEPTION_RAISED,
        aml_cleared=aml_cleared,
        kyc_verified=kyc_verified,
        rbi_norms_met=rbi_norms_met,
        compliance_passed=aml_cleared and kyc_verified and rbi_norms_met,
        flags=flags,
        required_actions=[flag.action_required for flag in flags],
        exception_type=_exception_type(flags),
        exception_message="; ".join(flag.description for flag in flags) or None,
        execution_ms=int((perf_counter() - started) * 1000),
    )
    log_event("agent.complianceguard.completed", case_id=payload.case_id, flags=len(flags))
    return output


def _flag(flag_type: str, severity: str, description: str, action: str) -> ComplianceFlag:
    return ComplianceFlag(
        flag_type=flag_type,
        severity=severity,
        description=description,
        action_required=action,
    )


def _exception_type(flags: list[ComplianceFlag]) -> str | None:
    if not flags:
        return None
    if any(flag.flag_type == "AML_WATCHLIST" for flag in flags):
        return "watchlist_match"
    if any(flag.flag_type == "KYC_MISMATCH" for flag in flags):
        return "kyc_mismatch"
    return "policy_breach"
