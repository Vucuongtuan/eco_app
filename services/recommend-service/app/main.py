from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import recommend, health
from app.consumers.rabbitmq_consumer import start_consumer
from app.services.data_loader import DataLoader
from app.services.collaborative import CollaborativeFilteringService
from app.services.content_based import ContentBasedService
from app.services.hybrid import HybridRecommender

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s", settings.APP_NAME)

    data_loader = DataLoader()
    cf_service = CollaborativeFilteringService()
    cb_service = ContentBasedService()
    recommender = HybridRecommender(cf_service, cb_service, data_loader)

    app.state.data_loader = data_loader
    app.state.recommender = recommender

    app.state.rabbitmq_connection = await start_consumer(data_loader)

    yield

    await app.state.rabbitmq_connection.close()
    await data_loader.engine.dispose()
    logger.info("Shutdown complete")


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# Allow all CORS origins for development/testing. Restrict in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(recommend.router, prefix=settings.API_PREFIX)
