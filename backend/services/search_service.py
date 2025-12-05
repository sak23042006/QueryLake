import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import re
import boto3

ABSOLUTE_THRESHOLD = 0.40
RELATIVE_FACTOR    = 0.80

# AWS S3 configuration
BUCKET = "lakerag-arun-bootcamp"
INDEX_PREFIX = "vector-index"
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.getenv("AWS_SECRET_ACCESS_KEY")

print("🔍 Initializing semantic search service...")

# Lazy loading - only load when needed
index = None
metadata = None
model = None

def _download_latest_from_s3(local_dir="/tmp/faiss"):
    """Download latest FAISS index and metadata from S3"""
    os.makedirs(local_dir, exist_ok=True)
    
    s3 = boto3.client("s3", region_name=AWS_REGION, 
                     aws_access_key_id=AWS_KEY, 
                     aws_secret_access_key=AWS_SECRET)
    
    # List and find latest files
    resp = s3.list_objects_v2(Bucket=BUCKET, Prefix=INDEX_PREFIX)
    objs = resp.get("Contents", [])
    
    if not objs:
        raise FileNotFoundError(f"No files found in s3://{BUCKET}/{INDEX_PREFIX}/")
    
    faiss_files = [o for o in objs if o["Key"].endswith(".faiss")]
    meta_files = [o for o in objs if o["Key"].endswith(".parquet")]
    
    if not faiss_files or not meta_files:
        raise FileNotFoundError("Missing .faiss or .parquet files in S3")
    
    latest_faiss = sorted(faiss_files, key=lambda x: x["LastModified"])[-1]["Key"]
    latest_meta = sorted(meta_files, key=lambda x: x["LastModified"])[-1]["Key"]
    
    index_path = os.path.join(local_dir, "index.faiss")
    meta_path = os.path.join(local_dir, "metadata.parquet")
    
    print(f"📥 Downloading {latest_faiss} from S3...")
    s3.download_file(BUCKET, latest_faiss, index_path)
    print(f"📥 Downloading {latest_meta} from S3...")
    s3.download_file(BUCKET, latest_meta, meta_path)
    
    return index_path, meta_path

def _ensure_loaded():
    """Lazy load FAISS index, metadata, and model on first search"""
    global index, metadata, model
    
    if index is not None:
        return  # Already loaded
    
    print("📥 Downloading latest FAISS index from S3...")
    index_path, meta_path = _download_latest_from_s3()
    
    print("📚 Loading FAISS index and metadata...")
    index = faiss.read_index(index_path)
    metadata = pd.read_parquet(meta_path)
    model = SentenceTransformer("BAAI/bge-large-en-v1.5")
    print(f"🚀 Search service ready. FAISS size: {index.ntotal} | metadata rows: {len(metadata)}")

# Load on startup (so errors show immediately, not on first request)
try:
    _ensure_loaded()
except Exception as e:
    print(f"⚠️  Failed to load FAISS index from S3: {e}")
    print("   Search will be unavailable until index is built and uploaded.")


# ---------------------------------------------------------------
# 🔥 Rewrite long questions → compact search-friendly expressions
# ---------------------------------------------------------------
def rewrite_query(q: str) -> str:
    q = q.lower()
    # remove only stop words, keep company names and important terms
    q = re.sub(
        r"\b(tell me|about|explain|what|were|can you|give|details|information|please|describe|do you know)\b",
        "",
        q
    )
    q = re.sub(r"[^a-z0-9 ]", " ", q)
    q = re.sub(r"\s+", " ", q).strip()
    return q if q else "default"  # fallback


# ---------------------------------------------------------------
# 🔍 Semantic search
# ---------------------------------------------------------------
def semantic_search(query: str, k: int = 5, doc_id: str | None = None):
    """
    If doc_id passed → bypass OOC and return ALL chunks in that doc.
    Otherwise → keyword rewrite + score filtering.
    """
    
    # Ensure FAISS index is loaded
    _ensure_loaded()

    # ⭐ If doc_id provided → return all chunks for that doc (no threshold)
    if doc_id:
        doc_rows = metadata[metadata["doc_id"] == doc_id]
        if doc_rows.empty:
            return [{"message": "Invalid doc_id — no document found"}]

        return [
            {
                "rank": i + 1,
                "score": 1.0,   # optional since doc_id match is absolute
                "doc_id": row.doc_id,
                "chunk_index": int(row.chunk_index),
                "chunk_text": row.chunk_text
            }
            for i, row in doc_rows.sort_values("chunk_index").reset_index(drop=True).itertuples()
        ]

    # ⭐ Rewrite natural-language questions → compact query
    clean_query = rewrite_query(query)
    print(f"💡 Rewritten Query for FAISS: '{clean_query}'")

    # Convert to FAISS embedding
    vec = model.encode(clean_query, normalize_embeddings=True)
    vec = np.expand_dims(vec, axis=0).astype("float32")

    scores, ids = index.search(vec, k)
    scores = scores[0]
    ids = ids[0]

    best = float(scores[0])
    print(f"🔎 BEST SCORE = {best:.4f}")

    # OOC check
    if best < ABSOLUTE_THRESHOLD:
        print("❌ OOC triggered: below absolute threshold")
        return [{"message": "Out of context — no relevant match found"}]

    cutoff = best * RELATIVE_FACTOR
    results = []
    rank = 1

    for score, idx in zip(scores, ids):
        score = float(score)
        if score < cutoff:
            continue

        row = metadata.iloc[idx]
        results.append({
            "rank": rank,
            "score": round(score, 4),
            "doc_id": row["doc_id"],
            "chunk_index": int(row["chunk_index"]),
            "chunk_text": row["chunk_text"],
        })
        rank += 1

    if not results:
        print("❌ All candidates filtered out → OOC")
        return [{"message": "Out of context — no relevant match found"}]

    return results
