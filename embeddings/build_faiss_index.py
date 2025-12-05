import os
import faiss
import pandas as pd
import numpy as np
import pyarrow.parquet as pq
import pyarrow as pa
from dotenv import load_dotenv
from datetime import datetime, timezone
import os

# Fix 1: Ensure correct working directory
os.chdir('/app/embeddings')

load_dotenv()

BUCKET = "lakerag-arun-bootcamp"
EMB_PREFIX = "gold-embeddings/"
INDEX_PREFIX = "vector-index/"

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_KEY    = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET = os.getenv("AWS_SECRET_ACCESS_KEY")

fs = pa.fs.S3FileSystem(
    region=AWS_REGION,
    access_key=AWS_KEY,
    secret_key=AWS_SECRET,
)

print(f"📥 Scanning S3 for parquet files → s3://{BUCKET}/{EMB_PREFIX}")

selector = pa.fs.FileSelector(f"{BUCKET}/{EMB_PREFIX}", recursive=False)
files = [f for f in fs.get_file_info(selector) if f.is_file]

if not files:
    print("❌ No parquet embedding files found — abort")
    exit()

dfs = []
for f in files:
    key = f.path
    print(f"🔍 Reading: s3://{key}")
    table = pq.read_table(key, filesystem=fs)
    dfs.append(table.to_pandas())

df = pd.concat(dfs, ignore_index=True)
print(f"✔ Loaded {len(df)} embedding rows")

emb = np.stack(df["embedding"].values).astype("float32")
dimension = emb.shape[1]

index = faiss.IndexFlatIP(dimension)
index.add(emb)

print(f"🎯 FAISS index built → vectors: {index.ntotal}")

os.makedirs("local_data/faiss", exist_ok=True)
local_index = "local_data/faiss/index.faiss"
local_meta  = "local_data/faiss/metadata.parquet"

faiss.write_index(index, local_index)
df.drop(columns=["embedding"]).to_parquet(local_meta, index=False)

def upload(local_path, s3_key):
    with open(local_path, "rb") as f_local:
        data = f_local.read()
    with fs.open_output_stream(s3_key) as f_s3:
        f_s3.write(data)

timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
index_key = f"{BUCKET}/{INDEX_PREFIX}index_{timestamp}.faiss"
meta_key  = f"{BUCKET}/{INDEX_PREFIX}metadata_{timestamp}.parquet"

print("🚀 Uploading FAISS artifacts...")
upload(local_index, index_key)
upload(local_meta, meta_key)

print("🎉 DONE — FAISS index uploaded")
print("📌 index:",    f"s3://{index_key}")
print("📌 metadata:", f"s3://{meta_key}")
