from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Ascend LMS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super_secret_jwt_key_dev_mode_only_change_in_prod"
    ENVIRONMENT: str = "development"

    # Async Database URL (default to localhost for local testing outside docker)
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:secure_db_pass_2026@localhost:5432/adaptive_sql"
    )

    # Sync Database URL for Alembic migrations if needed
    @property
    def sync_database_url(self) -> str:
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
