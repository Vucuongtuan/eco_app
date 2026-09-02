import logging
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from app.config import settings

logger = logging.getLogger(__name__)


class ContentBasedService:
    def __init__(self) -> None:
        self.vectorizer: TfidfVectorizer | None = None
        self.tfidf_matrix = None
        self.product_index: dict[int, str] = {}
        self._load_model()

    def train(self, products_df: pd.DataFrame) -> None:
        if products_df.empty:
            logger.warning("No products for CB training")
            return
        corpus = (products_df.get("name", "") + " " + products_df.get("description", "")).fillna("")
        self.vectorizer = TfidfVectorizer(max_features=10000, stop_words="english")
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.product_index = {i: pid for i, pid in enumerate(products_df["product_id"].tolist())}
        joblib.dump({"vectorizer": self.vectorizer, "matrix": self.tfidf_matrix, "index": self.product_index}, settings.CB_MODEL_PATH)
        logger.info("CB model trained: %d products", len(self.product_index))

    def _load_model(self) -> None:
        try:
            data = joblib.load(settings.CB_MODEL_PATH)
            self.vectorizer = data["vectorizer"]
            self.tfidf_matrix = data["matrix"]
            self.product_index = data["index"]
            logger.info("CB model loaded")
        except FileNotFoundError:
            logger.warning("No pre-trained CB model found yet")

    def recommend_for_user(self, history_product_ids: list[str], n: int = 10) -> list[tuple[str, float]]:
        if self.tfidf_matrix is None or self.vectorizer is None or not history_product_ids:
            return []

        # compute an aggregate profile for the user by averaging vectors of seen products
        idxs = [i for i, pid in self.product_index.items() if pid in history_product_ids]
        if not idxs:
            return []
        user_vec = self.tfidf_matrix[idxs].mean(axis=0)
        cosine_sim = linear_kernel(user_vec, self.tfidf_matrix).flatten()
        top_idx = cosine_sim.argsort()[::-1][:n]
        results = [(self.product_index[i], float(cosine_sim[i])) for i in top_idx if self.product_index[i] not in history_product_ids]
        return results
