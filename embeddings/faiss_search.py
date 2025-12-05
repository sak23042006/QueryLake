import os
import numpy as np
import pandas as pd
import faiss
import boto3
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

BUCKET       = "lakerag-arun-bootcamp"
INDEX_PREFIX = "vector-index"
AWS_REGION   = os.getenv("AWS_REGION", "ap-south-1")
AWS_KEY      = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET   = os.getenv("AWS_SECRET_ACCESS_KEY")

s3 = boto3.client("s3", region_name=AWS_REGION, aws_access_key_id=AWS_KEY, aws_secret_access_key=AWS_SECRET)

def _latest_keys():
    resp = s3.list_objects_v2(Bucket=BUCKET, Prefix=INDEX_PREFIX)
    objs = resp.get("Contents", [])
    faiss_files = [o for o in objs if o["Key"].endswith(".faiss")]
    meta_files  = [o for o in objs if o["Key"].endswith(".parquet")]
    latest_faiss = sorted(faiss_files, key=lambda x: x["LastModified"])[-1]["Key"]
    latest_meta  = sorted(meta_files,  key=lambda x: x["LastModified"])[-1]["Key"]
    return latest_faiss, latest_meta

def load_index(local_dir="local_data/runtime"):
    os.makedirs(local_dir, exist_ok=True)
    faiss_key, meta_key = _latest_keys()
    index_path = os.path.join(local_dir, "index.faiss")
    meta_path  = os.path.join(local_dir, "metadata.parquet")
    s3.download_file(BUCKET, faiss_key, index_path)
    s3.download_file(BUCKET, meta_key, meta_path)
    return faiss.read_index(index_path), pd.read_parquet(meta_path)

print("🧠 Loading model...")
_model = SentenceTransformer("BAAI/bge-large-en-v1.5")
print("📚 Loading local FAISS + metadata...")
_index, _meta = load_index()

def semantic_search(query: str, k=5):
    vec = _model.encode([query], normalize_embeddings=True).astype("float32")
    D, I = _index.search(vec, k)
    results = []
    for score, idx in zip(D[0], I[0]):
        row = _meta.iloc[int(idx)]
        results.append({
            "score": float(score),
            "chunk_text": row["chunk_text"],
            "chunk_id": row["chunk_id"],
            "doc_id": row["doc_id"],
            "chunk_index": int(row["chunk_index"]),
        })
    return results

if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) or "test query"
    for r in semantic_search(q, k=3):
        print("\n--------------------------")
        print("score:", r["score"])
        print("doc_id:", r["doc_id"])
        print("chunk_index:", r["chunk_index"])
        print("text:", r["chunk_text"][:200], "...")
