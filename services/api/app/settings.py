from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    provider_mode: str = "MOCK"
    database_url: str | None = None
    sqlite_path: str = "data/finflow.sqlite3"
    store_mode: str = "sqlite"
    webhook_token: str | None = None
    mock_bypass_webhook_auth: bool = True
    allowed_origins: str = (
        "http://127.0.0.1:5173,http://localhost:5173,"
        "http://127.0.0.1:4174,http://localhost:4174"
    )

    model_config = SettingsConfigDict(env_prefix="FINFLOW_", env_file=".env", extra="ignore")

    @property
    def origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
