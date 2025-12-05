import os
import json
import pandas as pd
import boto3

BUCKET = "lakerag-arun-bootcamp"
GOLD_PREFIX = "gold"

LOCAL_GOLD_DIR = "local_data/gold"
LOCAL_JSONL_DIR = "local_data/jsonl"
OUTPUT_JSONL = f"{LOCAL_JSONL_DIR}/fine_tune.jsonl"

os.makedirs(LOCAL_GOLD_DIR, exist_ok=True)
os.makedirs(LOCAL_JSONL_DIR, exist_ok=True)

# constants
MAX_OUTPUT_LENGTH = 600

# --- S3 client ---
s3 = boto3.client("s3")

def get_latest_gold_file():
    """Return the latest parquet file under gold/ from S3"""
    resp = s3.list_objects_v2(Bucket=BUCKET, Prefix=GOLD_PREFIX)
    objs = resp.get("Contents", [])

    parquet_objs = [o for o in objs if o["Key"].endswith(".parquet")]
    if not parquet_objs:
        raise FileNotFoundError("❌ No gold parquet found in S3 bucket")

    latest = sorted(parquet_objs, key=lambda x: x["LastModified"])[-1]["Key"]
    return latest

def download_gold():
    """Download latest gold parquet file to local_data/gold"""
    latest_key = get_latest_gold_file()
    filename = latest_key.split("/")[-1]
    local_path = os.path.join(LOCAL_GOLD_DIR, filename)

    print(f"⬇ Downloading {latest_key} → {local_path}")
    s3.download_file(BUCKET, latest_key, local_path)
    return local_path


# ---------- instruction classifier ----------
def get_instruction(chunk_text: str) -> str:
    lower = chunk_text.lower()
    if "experience" in lower or "intern" in lower or "worked" in lower:
        return "Summarize the professional work experience in this text:"
    elif "skills" in lower or "technical" in lower or "programming" in lower:
        return "Extract all technical skills mentioned in this text:"
    elif "education" in lower or "university" in lower or "b.tech" in lower:
        return "Summarize the academic background contained in the text:"
    return "Provide a clear and concise summary of the following text:"


# ---------- generate label text (output) ----------
def generate_output(chunk_text):
    return chunk_text.strip()[:MAX_OUTPUT_LENGTH]


# ---------- main ----------
def build_dataset():
    gold_path = download_gold()  # auto fetch S3 → local
    df = pd.read_parquet(gold_path)
    total = 0

    with open(OUTPUT_JSONL, "w") as f:
        for row in df.itertuples():
            record = {
                "instruction": get_instruction(row.chunk_text),
                "input": "",
                "output": generate_output(row.chunk_text),
                "metadata": {
                    "doc_id": row.doc_id,
                    "chunk_id": row.chunk_id,
                    "chunk_index": int(row.chunk_index),
                },
            }
            f.write(json.dumps(record) + "\n")
            total += 1

    print(f"\n🚀 JSONL dataset generated: {OUTPUT_JSONL}")
    print(f"📌 Total records written: {total}")


if __name__ == "__main__":
    build_dataset()
