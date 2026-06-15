from app.contracts import ExceptionSeverity, ExceptionType


def classify_exception(exception_type: str) -> ExceptionSeverity:
    mapping = {
        ExceptionType.MISSING_DOCUMENT.value: ExceptionSeverity.HUMAN_REQUIRED,
        ExceptionType.LOW_CONFIDENCE_EXTRACTION.value: ExceptionSeverity.HUMAN_REQUIRED,
        ExceptionType.BUREAU_API_FAILURE.value: ExceptionSeverity.AUTO_RESOLVABLE,
        ExceptionType.WATCHLIST_MATCH.value: ExceptionSeverity.CRITICAL,
        ExceptionType.KYC_MISMATCH.value: ExceptionSeverity.HUMAN_REQUIRED,
        ExceptionType.AGENT_TIMEOUT.value: ExceptionSeverity.AUTO_RESOLVABLE,
        ExceptionType.POLICY_BREACH.value: ExceptionSeverity.HUMAN_REQUIRED,
        ExceptionType.DOCUMENT_FRAUD_SIGNAL.value: ExceptionSeverity.CRITICAL,
    }
    return mapping.get(exception_type, ExceptionSeverity.HUMAN_REQUIRED)
