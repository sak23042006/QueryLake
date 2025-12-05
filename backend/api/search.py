from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.search_service import semantic_search

router = APIRouter(prefix="/search", tags=["Search"])

class SearchRequest(BaseModel):
    query: str
    k: int = 5

@router.post("")
@router.post("/")
def search(req: SearchRequest):
    hits = semantic_search(req.query, req.k)

    # Out-of-context case
    if len(hits) == 1 and "message" in hits[0]:
        return {
            "query": req.query,
            "count": 0,
            "results": [],
            "message": hits[0]["message"],
        }

    formatted = [
        {
            "rank": h["rank"],
            "score": h["score"],
            "doc_id": h["doc_id"],
            "chunk_index": h["chunk_index"],
            "text": h["chunk_text"],
        }
        for h in hits
    ]

    return {
        "query": req.query,
        "count": len(formatted),
        "results": formatted,
    }
