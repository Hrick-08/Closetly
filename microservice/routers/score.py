import numpy as np
from pydantic import BaseModel
from fastapi import APIRouter
from services.vector_store import vector_store
from config import settings

router = APIRouter(prefix="/score", tags=["Scoring"])

class ScoreRequest(BaseModel):
    embeddingIds: list[str]

@router.post("/")
async def score_compatibility(req: ScoreRequest):
    if len(req.embeddingIds) < 2:
        return {"compatibilityScore": 1.0}
        
    points = vector_store.batch_get(settings.collection_name, req.embeddingIds)
    vectors = [p["vector"] for p in points if p.get("vector")]
    
    if len(vectors) < 2:
        return {"compatibilityScore": 1.0}
        
    arr = np.array(vectors)
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    normalized = arr / (norms + 1e-10)
    
    similarity_matrix = np.dot(normalized, normalized.T)
    
    # average off-diagonal elements
    n = similarity_matrix.shape[0]
    mask = ~np.eye(n, dtype=bool)
    avg_score = float(np.mean(similarity_matrix[mask]))
    
    # bound between 0 and 1
    avg_score = max(0.0, min(1.0, avg_score))
    
    return {"compatibilityScore": avg_score}
