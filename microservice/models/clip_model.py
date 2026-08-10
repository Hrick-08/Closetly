import torch
import open_clip
import numpy as np
from PIL import Image

class CLIPModel:
    def __init__(self):
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def load(self, model_name: str, pretrained: str):
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=pretrained, device=self.device
        )
        self.tokenizer = open_clip.get_tokenizer(model_name)
        self.model.eval()

    def encode_image(self, pil_image: Image.Image) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("Model not loaded")
        image = self.preprocess(pil_image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            if torch.cuda.is_available():
                with torch.cuda.amp.autocast():
                    image_features = self.model.encode_image(image)
            else:
                image_features = self.model.encode_image(image)
            image_features /= image_features.norm(dim=-1, keepdim=True)
        return image_features.cpu().numpy().astype(np.float32).flatten()

    def encode_text(self, text: str) -> np.ndarray:
        return self.encode_texts([text]).flatten()

    def encode_texts(self, texts: list[str]) -> np.ndarray:
        if self.model is None:
            raise RuntimeError("Model not loaded")
        text_tokens = self.tokenizer(texts).to(self.device)
        with torch.no_grad():
            if torch.cuda.is_available():
                with torch.cuda.amp.autocast():
                    text_features = self.model.encode_text(text_tokens)
            else:
                text_features = self.model.encode_text(text_tokens)
            text_features /= text_features.norm(dim=-1, keepdim=True)
        return text_features.cpu().numpy().astype(np.float32)

clip_model = CLIPModel()
