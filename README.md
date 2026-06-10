# RESEARCHMENTORAI

A high-fidelity academic research intelligence platform integrating FAISS semantic search, Neo4j knowledge graphs, Gemini-powered learning journeys, and Supabase authentication.

## Features

- **OpenAlex Ingestion** — Fetch and store academic papers from OpenAlex API
- **PostgreSQL Storage** — Persistent paper metadata storage
- **FAISS Semantic Search** — Vector similarity search across paper embeddings
- **Hybrid Recommendations** — Content-based paper recommendations
- **Neo4j Knowledge Graph** — Interactive citation network visualization
- **Gemini AI Mentor** — Generate progressive learning roadmaps on any research topic
- **Supabase Auth** — Google OAuth authentication
- **Saved Library** — Bookmark papers and roadmaps

## Tech Stack

**Backend:** Python, FastAPI, PostgreSQL, FAISS, Neo4j, Google Gemini  
**Frontend:** Next.js 16, React 19, TypeScript, Framer Motion, Tailwind CSS  
**Auth:** Supabase (Google OAuth)

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
# Configure .env with database credentials
python main.py
```

### Frontend
```bash
cd frontend
npm install
# Configure .env.local with Supabase keys
npm run dev
```
