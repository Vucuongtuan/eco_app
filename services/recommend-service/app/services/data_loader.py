import json
import logging
import pandas as pd
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from redis.asyncio import Redis
from app.config import settings
from app.models.schemas import BehaviorEventEnvelope

logger = logging.getLogger(__name__)

EVENT_WEIGHTS = {
    "product_viewed": 1.0,
    "product_view_duration": 1.0,
    "variant_selected": 2.0,
    "size_selected": 2.0,
    "cart_added": 3.0,
    "wishlist_added": 3.0,
    "search_performed": 0.5,
}


class DataLoader:
    def __init__(self) -> None:
        self.engine: AsyncEngine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
        self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def record_event(self, event: BehaviorEventEnvelope) -> None:
        user_key = event.customerId or event.anonymousId
        if not user_key or not event.productId:
            return
        async with self.engine.begin() as conn:
            await conn.execute(
                text("""
                    INSERT IGNORE INTO behavior_events
                        (event_id, user_key, product_id, event_type, occurred_at, properties)
                    VALUES
                        (:event_id, :user_key, :product_id, :event_type, :occurred_at, :properties)
                """),
                {
                    "event_id": event.eventId,
                    "user_key": user_key,
                    "product_id": event.productId,
                    "event_type": event.eventType,
                    "occurred_at": event.occurredAt,
                    "properties": json.dumps(event.properties or {}),
                },
            )
        await self.redis.delete(f"user_history:{user_key}")

    async def get_user_history(self, user_id: str, limit: int = 50) -> list[dict]:
        cache_key = f"user_history:{user_id}"
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)

        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("""
                    SELECT product_id, event_type, occurred_at
                    FROM behavior_events
                    WHERE user_key = :user_id
                    ORDER BY occurred_at DESC
                    LIMIT :limit
                """),
                {"user_id": user_id, "limit": limit},
            )
            events = [dict(row._mapping) for row in result]

        await self.redis.setex(cache_key, settings.CACHE_TTL, json.dumps(events, default=str))
        return events

    async def get_all_interactions(self) -> pd.DataFrame:
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("SELECT user_key AS user_id, product_id, event_type FROM behavior_events")
            )
            rows = [dict(r._mapping) for r in result]

        df = pd.DataFrame(rows)
        if df.empty:
            return df
        df["weight"] = df["event_type"].map(EVENT_WEIGHTS).fillna(1.0)
        return df.groupby(["user_id", "product_id"], as_index=False)["weight"].sum()

    async def get_popular_products(self, n: int = 10) -> list[tuple[str, float]]:
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("""
                    SELECT product_id, COUNT(*) AS cnt
                    FROM behavior_events
                    GROUP BY product_id
                    ORDER BY cnt DESC
                    LIMIT :n
                """),
                {"n": n},
            )
        return [(r.product_id, float(r.cnt)) for r in result.fetchall()]

    async def get_all_products(self) -> pd.DataFrame:
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("SELECT product_id, name, description, category, brand FROM products")
            )
        return pd.DataFrame([dict(r._mapping) for r in result])
