import logging
import asyncio
from typing import Any
from serpapi import GoogleSearch
from config import settings
from utils.image_utils import download_image
from models.clip_model import clip_model
import numpy as np

logger = logging.getLogger(__name__)

async def search_products(image_url: str, query_text: str | None = None, num_results: int = 10) -> list[dict[str, Any]]:
    if not settings.serpapi_key:
        logger.warning("SERPAPI_KEY is missing.")
        return []
        
    try:
        def do_search():
            params = {
                "engine": "google_lens",
                "url": image_url,
                "api_key": settings.serpapi_key
            }
            search = GoogleSearch(params)
            return search.get_dict()
            
        results = await asyncio.to_thread(do_search)
        visual_matches = results.get("visual_matches", [])
        
        parsed_results = []
        for match in visual_matches:
            price_str = match.get("price", {}).get("extracted_value", 0)
            price = float(price_str) if price_str else 0.0
            
            parsed_results.append({
                "productUrl": match.get("link", ""),
                "imageUrl": match.get("thumbnail", ""),
                "title": match.get("title", ""),
                "price": price,
                "source": match.get("source", "")
            })
            
        if not parsed_results:
            return []
            
        # Refine with CLIP
        ref_image = await download_image(image_url)
        if not ref_image:
            return parsed_results[:num_results]
            
        ref_embedding = clip_model.encode_image(ref_image)
        
        async def fetch_and_embed(item):
            img = await download_image(item["imageUrl"])
            if img:
                try:
                    emb = clip_model.encode_image(img)
                    score = float(np.dot(ref_embedding, emb))
                    item["similarityScore"] = score
                except Exception:
                    item["similarityScore"] = 0.0
            else:
                item["similarityScore"] = 0.0
            return item
            
        tasks = [fetch_and_embed(item) for item in parsed_results[:20]]
        scored_results = await asyncio.gather(*tasks)
        
        scored_results.sort(key=lambda x: x.get("similarityScore", 0.0), reverse=True)
        return scored_results[:num_results]
        
    except Exception as e:
        logger.error(f"Shop search failed: {e}")
        return []
