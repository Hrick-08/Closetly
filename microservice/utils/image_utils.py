import io
import httpx
from PIL import Image

async def download_image(url: str) -> Image.Image | None:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10.0)
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content)).convert("RGB")
            return img
    except Exception:
        return None

def preprocess_upload(file_bytes: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    max_dim = 1024
    if max(img.size) > max_dim:
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
    return img

def image_to_bytes(image: Image.Image, format: str = "JPEG") -> bytes:
    buf = io.BytesIO()
    image.save(buf, format=format)
    return buf.getvalue()
