from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.settings import get_settings


class WebhookAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/webhooks"):
            settings = get_settings()
            if not (settings.provider_mode == "MOCK" and settings.mock_bypass_webhook_auth):
                expected = settings.webhook_token
                provided = request.headers.get("x-finflow-webhook-token")
                if not expected or provided != expected:
                    return JSONResponse({"detail": "Invalid webhook token"}, status_code=401)
        return await call_next(request)
