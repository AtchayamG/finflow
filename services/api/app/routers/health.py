from fastapi import APIRouter

from app.settings import get_settings

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"service": "finflow-api", "provider_mode": get_settings().provider_mode, "status": "ok"}
