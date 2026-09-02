from fastapi import APIRouter, Request
from app.config import settings

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    ok = {"db": False, "redis": False, "rabbitmq": False}
    # DB check
    try:
        async with request.app.state.data_loader.engine.connect() as conn:
            await conn.execute("SELECT 1")
        ok["db"] = True
    except Exception:
        ok["db"] = False

    try:
        await request.app.state.data_loader.redis.ping()
        ok["redis"] = True
    except Exception:
        ok["redis"] = False

    try:
        if hasattr(request.app.state, "rabbitmq_connection") and request.app.state.rabbitmq_connection is not None:
            ok["rabbitmq"] = True
    except Exception:
        ok["rabbitmq"] = False

    return {"status": "ok" if all(ok.values()) else "degraded", "checks": ok}
