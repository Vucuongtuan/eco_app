import logging
import joblib
import pandas as pd
from scipy.sparse import csr_matrix
from implicit.als import AlternatingLeastSquares
from app.config import settings

logger = logging.getLogger(__name__)


class CollaborativeFilteringService:
    def __init__(self) -> None:
        self.model: AlternatingLeastSquares | None = None
        self.user_index: dict[str, int] = {}
        self.item_index: dict[str, int] = {}
        self.index_item: dict[int, str] = {}
        self.user_items: csr_matrix | None = None
        self.load_model()

    def train(self, interactions_df: pd.DataFrame) -> None:
        if interactions_df.empty:
            logger.warning("No interactions to train on yet")
            return

        users = interactions_df["user_id"].astype("category")
        items = interactions_df["product_id"].astype("category")

        self.user_index = {u: i for i, u in enumerate(users.cat.categories)}
        self.item_index = {p: i for i, p in enumerate(items.cat.categories)}
        self.index_item = {i: p for p, i in self.item_index.items()}

        matrix = csr_matrix(
            (interactions_df["weight"], (users.cat.codes, items.cat.codes)),
            shape=(len(self.user_index), len(self.item_index)),
        )
        self.user_items = matrix.tocsr()

        model = AlternatingLeastSquares(factors=64, regularization=0.05, iterations=20)
        model.fit(self.user_items)
        self.model = model

        joblib.dump(
            {
                "model": self.model,
                "user_index": self.user_index,
                "item_index": self.item_index,
                "index_item": self.index_item,
                "user_items": self.user_items,
            },
            settings.CF_MODEL_PATH,
        )
        logger.info("CF model trained: %d users, %d items", len(self.user_index), len(self.item_index))

    def load_model(self) -> None:
        try:
            data = joblib.load(settings.CF_MODEL_PATH)
            self.model = data["model"]
            self.user_index = data["user_index"]
            self.item_index = data["item_index"]
            self.index_item = data["index_item"]
            self.user_items = data["user_items"]
            logger.info("CF model loaded")
        except FileNotFoundError:
            logger.warning("No pre-trained CF model found yet")

    def predict_for_user(self, user_id: str, n: int = 10) -> list[tuple[str, float]]:
        if self.model is None or user_id not in self.user_index:
            return []
        idx = self.user_index[user_id]
        item_ids, scores = self.model.recommend(
            idx, self.user_items[idx], N=n, filter_already_liked_items=True
        )
        return [(self.index_item[i], float(s)) for i, s in zip(item_ids, scores)]
