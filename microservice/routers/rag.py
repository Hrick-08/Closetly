from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter
from services.rag_service import build_context, generate_response

router = APIRouter(prefix="/rag", tags=["RAG Agent"])

class RagRequest(BaseModel):
    message: str
    userId: str
    chatHistory: Optional[list[dict]] = None

@router.post("/")
async def chat(req: RagRequest):
    context = await build_context(req.userId)
    response = await generate_response(req.message, context, req.chatHistory)
    return response
