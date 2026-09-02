import anyio
from app.services.collaborative import CollaborativeFilteringService
from app.services.content_based import ContentBasedService
from app.services.data_loader import DataLoader
from app.config import settings


class HybridRecommender:
    def __init__(
        self,
        cf: CollaborativeFilteringService,
        cb: ContentBasedService,
        data_loader: DataLoader,
    ) -> None:
        self.cf_service = cf
        self.cb_service = cb
        self.data_loader = data_loader

    async def get_recommendations(
        self,
        user_id: str,
        n: int = 10,
        exclude_products: list[str] | None = None,
        include_explanation: bool = False,
    ) -> list[dict]:
        exclude_products = exclude_products or []

        cf_results = await anyio.to_thread.run_sync(self.cf_service.predict_for_user, user_id, n * 2)
        if not cf_results:
            cf_results = await self.data_loader.get_popular_products(n * 2)

        history = await self.data_loader.get_user_history(user_id)
        history_ids = [h["product_id"] for h in history]
        cb_results = await anyio.to_thread.run_sync(
            self.cb_service.recommend_for_user, history_ids, n * 2
        )

        blended = self._blend_results(cf_results, cb_results)
        blended = [r for r in blended if r["product_id"] not in exclude_products]
        results = blended[:n]

        if include_explanation:
            results = self._add_explanations(results, cf_results, cb_results)
        # normalize output shape
        return [{"product_id": r["product_id"], "score": float(r["score"]), "reason": r.get("reason"), "source": r.get("source", "hybrid")} for r in results]

    def _blend_results(self, cf_results, cb_results) -> list[dict]:
        # cf_results: list of (product_id, score) or list of tuples
        # cb_results: list of (product_id, score)
        scores = {}
        for pid, s in cf_results:
            scores.setdefault(pid, {"cf": 0.0, "cb": 0.0})
            scores[pid]["cf"] = max(scores[pid]["cf"], float(s))
        for pid, s in cb_results:
            scores.setdefault(pid, {"cf": 0.0, "cb": 0.0})
            scores[pid]["cb"] = max(scores[pid]["cb"], float(s))

        blended = []
        for pid, parts in scores.items():
            score = parts["cf"] * settings.HYBRID_WEIGHT_CF + parts["cb"] * settings.HYBRID_WEIGHT_CB
            blended.append({"product_id": pid, "score": score, "source": "hybrid"})

        blended.sort(key=lambda x: x["score"], reverse=True)
        return blended

    def _add_explanations(self, results, cf_results, cb_results) -> list[dict]:
        cf_map = {pid: s for pid, s in cf_results}
        cb_map = {pid: s for pid, s in cb_results}
        for r in results:
            parts = []
            pid = r["product_id"]
            if pid in cf_map:
                parts.append(f"CF:{cf_map[pid]:.3f}")
            if pid in cb_map:
                parts.append(f"CB:{cb_map[pid]:.3f}")
            r["reason"] = ", ".join(parts) if parts else None
        return results
