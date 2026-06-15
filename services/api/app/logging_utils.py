import logging


logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("finflow")


def log_event(event: str, **fields: object) -> None:
    payload = {"event": event, **fields}
    logger.info(payload)
