from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter
from services.shop_search import search_products

router = APIRouter(prefix="/shop-lookup", tags=["Shop"])

class ShopRequest(BaseModel):
    imageUrl: str
    queryText: Optional[str] = None
    numResults: int = 10

@router.post("/")
async def shop_lookup(req: ShopRequest):
    results = await search_products(req.imageUrl, req.queryText, req.numResults)
    return {"results": results}
