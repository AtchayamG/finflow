from time import perf_counter

from app.contracts import (
    AgentStatus,
    DocuMindInput,
    DocuMindOutput,
    ExtractedDocument,
    ExtractedField,
)
from app.logging_utils import log_event


def run_documind(payload: DocuMindInput) -> DocuMindOutput:
    started = perf_counter()
    docs: list[ExtractedDocument] = []
    missing = set(payload.expected_doc_types)

    for index, doc_type in enumerate(payload.expected_doc_types, start=1):
        confidence = 0.72 if doc_type in {"aadhaar", "id"} else 0.94
        fields = [
            ExtractedField(field_name="applicant_id", value=payload.applicant_id, confidence=0.99, page_number=index),
            ExtractedField(field_name="document_type", value=doc_type, confidence=confidence, page_number=index),
        ]
        docs.append(
            ExtractedDocument(
                document_url=f"synthetic://{payload.case_id}/{doc_type}.pdf",
                document_type=doc_type,
                extracted_fields=fields,
                validation_passed=confidence >= 0.8,
                missing_fields=[] if confidence >= 0.8 else ["masked_identity_field"],
            )
        )
        missing.discard(doc_type)

    exception_type = None
    exception_message = None
    if missing:
        exception_type = "missing_document"
        exception_message = f"Missing required document(s): {', '.join(sorted(missing))}"
    elif any(not doc.validation_passed for doc in docs):
        exception_type = "low_confidence_extraction"
        exception_message = "Masked identity field needs human confirmation."

    output = DocuMindOutput(
        case_id=payload.case_id,
        agent_status=AgentStatus.EXCEPTION_RAISED if exception_type else AgentStatus.SUCCESS,
        documents=docs,
        all_docs_extracted=not missing,
        exception_type=exception_type,
        exception_message=exception_message,
        execution_ms=int((perf_counter() - started) * 1000),
    )
    log_event("agent.documind.completed", case_id=payload.case_id, status=output.agent_status.value)
    return output
