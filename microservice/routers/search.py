from fastapi import APIRouter, UploadFile, Form, File
from models.clip_model import clip_model
from services.vector_store import vector_store
from utils.image_utils import preprocess_upload
from config import settings

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("/")
async def search_similar(
    userId: str = Form(...),
    topK: int = Form(10),
    image: UploadFile = File(...)
):
    file_bytes = await image.read()
    pil_image = preprocess_upload(file_bytes)
    
    embedding = clip_model.encode_image(pil_image)
    
    filter_cond = {"must": [{"key": "userId", "match": {"value": userId}}]}
    results = vector_store.search_similar(
        collection=settings.collection_name,
        vector=embedding.tolist(),
        filter_conditions=filter_cond,
        top_k=topK
    )
    
    matches = [{"closetItemId": r["payload"].get("closetItemId"), "score": r["score"]} for r in results]
    
    return {"matches": matches}
