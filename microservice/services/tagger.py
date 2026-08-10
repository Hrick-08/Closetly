from PIL import Image
import numpy as np
from models.clip_model import clip_model

CATEGORIES = ["top", "bottom", "dress", "outerwear", "footwear", "bag", "accessory"]
COLORS = ["black", "white", "red", "blue", "green", "yellow", "pink", "beige", "brown", "gray", "navy", "olive", "burgundy", "cream", "orange", "purple"]
PATTERNS = ["solid", "striped", "plaid", "floral", "polka dot", "graphic print", "animal print", "geometric", "abstract"]

def auto_tag(image: Image.Image) -> dict:
    image_features = clip_model.encode_image(image)
    
    cat_prompts = [f"a photo of a {c} clothing item" for c in CATEGORIES]
    col_prompts = [f"a {c} colored garment" for c in COLORS]
    pat_prompts = [f"a garment with a {p} pattern" for p in PATTERNS]
    
    cat_features = clip_model.encode_texts(cat_prompts)
    col_features = clip_model.encode_texts(col_prompts)
    pat_features = clip_model.encode_texts(pat_prompts)
    
    def get_best(features, labels):
        similarities = (image_features @ features.T).flatten()
        best_idx = int(np.argmax(similarities))
        return labels[best_idx], float(similarities[best_idx])
        
    best_cat, cat_conf = get_best(cat_features, CATEGORIES)
    best_col, col_conf = get_best(col_features, COLORS)
    best_pat, pat_conf = get_best(pat_features, PATTERNS)
    
    return {
        "category": best_cat,
        "color": best_col,
        "pattern": best_pat,
        "confidence": {
            "category": cat_conf,
            "color": col_conf,
            "pattern": pat_conf
        }
    }
