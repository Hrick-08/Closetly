from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    llm_api_key: str = ""
    llm_provider: str = "gemini"
    serpapi_key: str = ""
    clip_model: str = "ViT-B-32"
    clip_pretrained: str = "laion2b_s34b_b79k"
    collection_name: str = "closet_embeddings"
    rag_collection_name: str = "fashion_knowledge"

    model_config = {"env_file": ".env"}

settings = Settings()
