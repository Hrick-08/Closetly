# Closetly — Build Guide

**The All-in-One Fashion App**
A unified platform for closet cataloging, visual outfit search, outfit building, and AI-powered styling — built as a Full Stack MERN + ML semester project.

---

## 1. Project Overview

Closetly solves four separate problems in one app:

| Feature | What it does | Core tech |
|---|---|---|
| Closet Upload & Cataloging | Upload clothing photos → auto-tagged (category, color, pattern) | CLIP zero-shot classification |
| Visual Search from Reference | Upload an inspo pic → find matching pieces in your closet | CLIP embeddings + vector similarity |
| Shop-the-Look (Web Search) | For pieces you don't own, find buyable matches online from the same reference pic | Web scraping/search API + CLIP re-ranking |
| Outfit Builder & Visualizer | Drag-and-drop canvas to compose outfits, scored for compatibility | Embedding-based compatibility scoring |
| RAG Fashion Agent | Chat with an AI stylist grounded in your actual closet | RAG pipeline + LLM |

**MVP scope for the semester:** all five features above, flat-lay style visualization (no virtual try-on). Virtual try-on (warping clothes onto a body photo) is a stretch goal only — don't let it block the MVP.

---

## 2. Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   React Client   │─────▶│  Node/Express API │─────▶│   MongoDB (Atlas)    │
│  (Tailwind, DnD)  │◀─────│   (auth, CRUD)     │◀─────│  users/closets/etc.  │
└─────────────────┘      └──────────┬────────┘      └─────────────────────┘
                                     │
                                     │ internal calls
                                     ▼
                          ┌──────────────────────┐      ┌────────────────┐
                          │  Python FastAPI (ML)  │─────▶│  Qdrant (vector) │
                          │  CLIP, RAG, scoring    │◀─────│   embeddings     │
                          └──────────┬────────────┘      └────────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │   LLM API (OpenAI/     │
                          │   Gemini/OpenClaw)     │
                          └──────────────────────┘
```

**Why this split:** Node/Express handles auth, CRUD, and orchestration — things it's fast and simple for. Python/FastAPI is a separate microservice purely for ML work (CLIP inference, RAG retrieval, scoring, product search), since that's where the ML libraries actually live. Node calls the Python service over internal HTTP. This polyglot setup is also a good interview talking point.

**Shop-the-look flow specifically:** when a reference image doesn't fully match anything in the user's closet, the Python service queries a product search API (SerpAPI's Google Shopping/Google Lens endpoints work well — you've already used SerpAPI in FashionFind) for visually similar buyable items, scrapes/parses product-level pages for price and a direct link, then re-ranks results by CLIP similarity to the reference image before returning them. This reuses the exact `inurl:` filtering approach from FashionFind to make sure links land on actual product pages instead of category/listing pages.

---

## 3. Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, `react-dnd` or `@dnd-kit` for the outfit canvas, Axios/React Query
- **Backend (core):** Node.js, Express, JWT auth, Mongoose
- **ML microservice:** Python 3.11, FastAPI, `transformers`/`open_clip` for CLIP, `qdrant-client`
- **Database:** MongoDB (users, closet items, outfits, chat history) + Qdrant (image/text embeddings)
- **Image storage:** Cloudinary or AWS S3 (store URLs in MongoDB, not blobs)
- **LLM:** OpenAI API / Gemini API (swap in your OpenClaw setup if you want to reuse R.I.S.H.I. infra)
- **Deployment:** Vercel/Netlify (frontend), Render/Railway (Node API), a small VM or Render (Python service) — your Oracle/Azure free-tier VMs work fine here too

---

## 4. Data Model (MongoDB)

```js
// users
{
  _id, name, email, passwordHash,
  createdAt
}

// closetItems
{
  _id, userId,
  imageUrl,
  category,       // e.g. "top", "bottom", "outerwear", "footwear"
  color,          // dominant color, auto-tagged
  pattern,        // solid, striped, plaid, etc.
  tags: [String], // free-form, e.g. "streetwear", "formal"
  embeddingId,    // reference to vector stored in Qdrant
  createdAt
}

// outfits
{
  _id, userId,
  name,
  itemIds: [ObjectId],   // refs to closetItems
  compatibilityScore,    // computed at save/build time
  imageUrl,               // rendered flat-lay preview, optional
  createdAt
}

// chatSessions
{
  _id, userId,
  messages: [{ role, content, createdAt }],
  createdAt
}

// shopResults (cached web-scraped matches for a reference image, avoids re-scraping)
{
  _id, userId,
  referenceImageUrl,
  results: [{
    productUrl, imageUrl, title, price, source, // e.g. "Myntra", "Nykaa"
    similarityScore
  }],
  createdAt   // used for cache expiry, e.g. re-scrape after 7 days
}
```

Qdrant stores one collection for closet-item image embeddings (payload: `userId`, `closetItemId`) and optionally a second collection for the RAG knowledge base (style guides, color theory articles).

---

## 5. Build Order (suggested week-by-week)

**Phase 1 — Foundation (Weeks 1–2)**
- Set up MERN skeleton: Express API, MongoDB schemas, JWT auth, React app scaffold
- Basic CRUD: register/login, add/view/delete closet items (no ML yet — just image upload + manual tags)
- Get image upload → Cloudinary/S3 working end to end

**Phase 2 — Auto-tagging + Visual Search (Weeks 3–5)**
- Stand up the Python FastAPI service, add CLIP model loading
- Endpoint: `POST /embed` — takes an image, returns CLIP embedding, auto-suggests category/color tags
- Wire this into closet item upload (Node calls Python service on new item creation)
- Set up Qdrant, store embeddings on upload
- Endpoint: `POST /search` — takes a reference image, returns top-k similar closet items for that user

**Phase 3 — Shop-the-Look / Web Search (Weeks 6–7)**
- Integrate a product search API (SerpAPI Google Lens/Shopping, or scrape target sites directly with `httpx` + BeautifulSoup)
- Endpoint: `POST /shop-lookup` — takes a reference image, queries the search API, filters results to actual product-page URLs (not category pages), re-ranks by CLIP similarity to the reference image
- Cache results in `shopResults` so repeated searches on the same reference image don't re-scrape
- Note: this only runs when visual search against the user's own closet doesn't find a strong enough match — closet search should always be tried first since it's faster and free

**Phase 4 — Outfit Builder (Weeks 8–9)**
- React drag-and-drop canvas: pick items from closet, arrange into an outfit
- Save outfit to MongoDB
- Compatibility scoring: start simple (average pairwise cosine similarity of item embeddings, or a small rule-based color/category compatibility heuristic) before attempting anything GNN-based
- Stretch: train a small GNN on a dataset like Polyvore if time allows, otherwise the heuristic scorer is a perfectly legitimate MVP

**Phase 5 — RAG Fashion Agent (Weeks 10–11)**
- Build a small knowledge base (style/color-theory articles, scraped or written) and embed it into Qdrant
- RAG endpoint: retrieve relevant knowledge chunks + user's closet/outfit context → pass to LLM → return styling advice
- Chat UI in React, persist history in MongoDB
- Tool-calling pattern (reusable from R.I.S.H.I.): agent can call `get_closet_items`, `get_saved_outfits`, optionally `get_weather` for occasion-based advice

**Phase 6 — Polish (Weeks 12–13)**
- Error handling, loading states, empty states
- Deploy all three services (frontend, Node API, Python ML service)
- Write project report / demo video
- Optional stretch: virtual try-on with pose estimation, only if everything above is solid

---

## 6. Key API Endpoints

**Node/Express**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/closet
POST   /api/closet            (uploads image, forwards to ML service for tagging)
DELETE /api/closet/:id
POST   /api/outfits
GET    /api/outfits
POST   /api/search/reference   (proxies to Python /search)
POST   /api/shop/lookup         (proxies to Python /shop-lookup)
POST   /api/chat                (proxies to Python /rag)
```

**Python/FastAPI**
```
POST /embed          -> { embedding, suggestedTags }
POST /search          -> { matches: [closetItemId, score] }
POST /shop-lookup     -> { results: [{ productUrl, imageUrl, title, price, source, similarityScore }] }
POST /score            -> { compatibilityScore }
POST /rag               -> { reply, sourcesUsed }
```

---

## 7. Setup Instructions

```bash
# Backend (Node)
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, ML_SERVICE_URL
npm run dev

# ML service (Python)
cd ml-service
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn open_clip_torch qdrant-client python-multipart httpx beautifulsoup4 google-search-results
uvicorn main:app --reload --port 8000

# Frontend (React)
cd client
npm install
npm run dev
```

**.env essentials**
```
MONGO_URI=
JWT_SECRET=
CLOUDINARY_URL= (or AWS_S3_*)
ML_SERVICE_URL=http://localhost:8000
QDRANT_URL=
LLM_API_KEY=
SERPAPI_KEY=
```

---

## 8. Scope Discipline

The single biggest risk to a project like this is scope creep — it's genuinely ambitious. Guardrails:
- Ship the flat-lay outfit builder before even considering virtual try-on
- Use a heuristic/embedding-based compatibility scorer before attempting a custom GNN
- Get one CLIP-based feature (auto-tagging) rock solid before adding the second (visual search) — they share the same embedding pipeline, so this is less work than it sounds
- The RAG agent can start with just the LLM + closet context (no external knowledge base) and add the knowledge-base retrieval later — a working simple agent beats a broken sophisticated one
- Prefer a search API (SerpAPI) over raw scraping where possible — it's faster to build, avoids getting IP-blocked by retailers, and sidesteps ToS gray areas; only fall back to direct scraping for a specific site if the API doesn't cover it

---

## 9. Stretch Goals (only after MVP is done)

- Virtual try-on via pose estimation + garment warping (VITON-style)
- Weather-aware outfit suggestions
- Shopping recommendations for missing pieces (SerpAPI-based product search)
- Social features: share outfits, follow other users' closets