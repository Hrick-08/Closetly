import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, Form, File
from models.clip_model import clip_model
from services.tagger import auto_tag
from services.vector_store import vector_store
from utils.image_utils import preprocess_upload
from config import settings

router = APIRouter(prefix="/embed", tags=["Embeddings"])

@router.post("/")
async def create_embedding(
    userId: str = Form(...),
    closetItemId: Optional[str] = Form(None),
    image: UploadFile = File(...)
):
    file_bytes = await image.read()
    pil_image = preprocess_upload(file_bytes)
    
    embedding = clip_model.encode_image(pil_image)
    tags = auto_tag(pil_image)
    
    point_id = str(uuid.uuid4())
    payload = {
        "userId": userId,
        "closetItemId": closetItemId,
        "category": tags["category"],
        "color": tags["color"],
        "pattern": tags["pattern"]
    }
    
    vector_store.upsert_embedding(
        collection=settings.collection_name,
        point_id=point_id,
        vector=embedding.tolist(),
        payload=payload
    )
    
    return {
        "embeddingId": point_id,
        "suggestedTags": tags
    }
