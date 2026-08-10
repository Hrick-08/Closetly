import logging
import httpx
from config import settings
from services.vector_store import vector_store

logger = logging.getLogger(__name__)

async def build_context(user_id: str) -> str:
    # Query Qdrant
    try:
        filter_conditions = {"must": [{"key": "userId", "match": {"value": user_id}}]}
        results = vector_store.search_similar(
            collection=settings.collection_name,
            vector=[0.0]*512,
            filter_conditions=filter_conditions,
            top_k=100
        )
        
        counts = {}
        for r in results:
            cat = r["payload"].get("category", "unknown")
            col = r["payload"].get("color", "unknown")
            if cat not in counts:
                counts[cat] = []
            counts[cat].append(col)
            
        summary_parts = []
        for cat, cols in counts.items():
            summary_parts.append(f"{len(cols)} {cat}s ({', '.join(cols)})")
            
        if not summary_parts:
            return "User's wardrobe is empty."
            
        return "User's wardrobe contains: " + ", ".join(summary_parts)
    except Exception as e:
        logger.error(f"Failed to build context: {e}")
        return "User's wardrobe context is unavailable."

async def generate_response(message: str, context: str, chat_history: list[dict] | None = None) -> dict:
    if not settings.llm_api_key:
        return {"reply": "LLM API key is missing.", "sourcesUsed": []}
        
    system_prompt = f"You are a fashion stylist assistant. You have knowledge of the user's wardrobe.\nContext: {context}"
    
    if chat_history is None:
        chat_history = []
        
    try:
        async with httpx.AsyncClient() as client:
            if settings.llm_provider.lower() == "gemini":
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.llm_api_key}"
                
                parts = [{"text": f"System: {system_prompt}\n"}]
                for msg in chat_history[-10:]:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    parts.append({"text": f"{role}: {content}\n"})
                parts.append({"text": f"user: {message}"})
                
                payload = {"contents": [{"parts": parts}]}
                
                resp = await client.post(url, json=payload, timeout=30.0)
                resp.raise_for_status()
                data = resp.json()
                
                reply = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"reply": reply, "sourcesUsed": ["wardrobe"]}
                
            elif settings.llm_provider.lower() == "openai":
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {settings.llm_api_key}"}
                
                messages = [{"role": "system", "content": system_prompt}]
                for msg in chat_history[-10:]:
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
                messages.append({"role": "user", "content": message})
                
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": messages
                }
                
                resp = await client.post(url, json=payload, headers=headers, timeout=30.0)
                resp.raise_for_status()
                data = resp.json()
                
                reply = data["choices"][0]["message"]["content"]
                return {"reply": reply, "sourcesUsed": ["wardrobe"]}
            else:
                return {"reply": f"Unsupported LLM provider: {settings.llm_provider}", "sourcesUsed": []}
    except Exception as e:
        logger.error(f"LLM API call failed: {e}")
        return {"reply": "I'm sorry, I couldn't generate a response at this time.", "sourcesUsed": []}
