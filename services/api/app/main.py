from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import WebhookAuthMiddleware
from app.routers import analytics, cases, health, webhooks
from app.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    api = FastAPI(title="FinFlow API", version="0.2.0")
    api.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    api.add_middleware(WebhookAuthMiddleware)
    api.include_router(health.router)
    api.include_router(cases.router)
    api.include_router(webhooks.router)
    api.include_router(analytics.router)
    return api


app = create_app()
