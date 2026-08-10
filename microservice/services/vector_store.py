import logging
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct, Filter
from config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.client = None
        if not settings.qdrant_url:
            logger.warning("QDRANT_URL is not set. Vector store will be disabled.")
            return
        
        try:
            self.client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key if settings.qdrant_api_key else None
            )
            # test connection
            self.client.get_collections()
        except Exception as e:
            logger.warning(f"Failed to connect to Qdrant: {e}")
            self.client = None

    def ensure_collection(self, name: str, vector_size: int = 512):
        if not self.client:
            return
        collections = self.client.get_collections().collections
        if not any(c.name == name for c in collections):
            self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
            )

    def upsert_embedding(self, collection: str, point_id: str, vector: list[float], payload: dict):
        if not self.client:
            logger.warning("Qdrant client not available for upsert.")
            return
        self.client.upsert(
            collection_name=collection,
            points=[PointStruct(id=point_id, vector=vector, payload=payload)]
        )

    def search_similar(self, collection: str, vector: list[float], filter_conditions: dict | None, top_k: int = 10) -> list[dict]:
        if not self.client:
            logger.warning("Qdrant client not available for search.")
            return []
        
        query_filter = None
        if filter_conditions:
            must_conditions = []
            if "must" in filter_conditions:
                from qdrant_client.models import FieldCondition, MatchValue
                for cond in filter_conditions["must"]:
                    must_conditions.append(
                        FieldCondition(
                            key=cond["key"],
                            match=MatchValue(value=cond["match"]["value"])
                        )
                    )
            if must_conditions:
                query_filter = Filter(must=must_conditions)
                
        results = self.client.search(
            collection_name=collection,
            query_vector=vector,
            query_filter=query_filter,
            limit=top_k
        )
        return [{"id": str(r.id), "score": r.score, "payload": r.payload or {}} for r in results]

    def delete_point(self, collection: str, point_id: str):
        if not self.client:
            return
        self.client.delete(collection_name=collection, points_selector=[point_id])

    def batch_get(self, collection: str, ids: list[str]) -> list[dict]:
        if not self.client:
            return []
        points = self.client.retrieve(collection_name=collection, ids=ids, with_vectors=True)
        return [{"id": str(p.id), "vector": p.vector, "payload": p.payload or {}} for p in points]

vector_store = VectorStore()
