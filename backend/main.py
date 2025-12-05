import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.search import router as search_router
from backend.api.summarize import router as summarize_router

from dotenv import load_dotenv

# Load .env globally for backend
load_dotenv()

app = FastAPI(title="LakeRAG API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router)
app.include_router(summarize_router)

@app.get("/health")
def health():
    return {"status": "ok"}