from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BehaviorEventEnvelope(BaseModel):
    eventId: str
    eventType: str
    version: int
    occurredAt: datetime
    customerId: Optional[str] = None
    anonymousId: Optional[str] = None
    sessionId: str
    productId: Optional[str] = None
    variantId: Optional[str] = None
    properties: dict = {}


class RecommendRequest(BaseModel):
    user_id: str
    limit: int = 10
    exclude_products: list[str] = []
    include_explanation: bool = False


class ProductRecommendation(BaseModel):
    product_id: str
    score: float
    reason: Optional[str] = None
    source: str


class RecommendResponse(BaseModel):
    user_id: str
    recommendations: list[ProductRecommendation]
    timestamp: datetime
