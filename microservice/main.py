import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from models.clip_model import clip_model
from routers import embed, search, shop, score, rag

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load CLIP model on startup
    logger.info("Loading CLIP model...")
    clip_model.load(settings.clip_model, settings.clip_pretrained)
    logger.info("CLIP model loaded.")
    yield

app = FastAPI(title="Closetly ML Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(embed.router)
app.include_router(search.router)
app.include_router(shop.router)
app.include_router(score.router)
app.include_router(rag.router)

@app.get("/")
def health_check():
    return {"status": "ok", "model": settings.clip_model}
