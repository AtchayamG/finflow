class WorkflowError(ValueError):
    pass


class ExternalServiceError(RuntimeError):
    pass


class AgentTimeoutError(ExternalServiceError):
    pass
