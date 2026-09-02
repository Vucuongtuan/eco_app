from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Recommendation Service"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    DATABASE_URL: str
    REDIS_URL: str = "redis://redis:6379/0"
    CACHE_TTL: int = 300

    RABBITMQ_URL: str
    RABBITMQ_EXCHANGE: str = "moon.events"
    RABBITMQ_CONSUME_QUEUE: str = "recommendation.events"
    RABBITMQ_BINDING_ROUTING_KEY: str = "behavior.event"
    RABBITMQ_DLX: str = "moon.events.dlx"
    RABBITMQ_DLQ: str = "recommendation.events.dlq"
    RABBITMQ_DEAD_ROUTING_KEY: str = "recommendation.event.dead"

    CF_MODEL_PATH: str = "data/processed/cf_model.pkl"
    CB_MODEL_PATH: str = "data/processed/cb_model.pkl"
    HYBRID_WEIGHT_CF: float = 0.6
    HYBRID_WEIGHT_CB: float = 0.4
    N_RECOMMENDATIONS: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
