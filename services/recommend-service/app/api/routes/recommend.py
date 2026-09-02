from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from app.models.schemas import RecommendRequest, RecommendResponse, ProductRecommendation

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post("/", response_model=RecommendResponse)
async def get_recommendations(payload: RecommendRequest, request: Request):
    recommender = request.app.state.recommender
    try:
        results = await recommender.get_recommendations(
            user_id=payload.user_id,
            n=payload.limit,
            exclude_products=payload.exclude_products,
            include_explanation=payload.include_explanation,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    return RecommendResponse(
        user_id=payload.user_id,
        recommendations=[ProductRecommendation(**r) for r in results],
        timestamp=datetime.utcnow(),
    )
