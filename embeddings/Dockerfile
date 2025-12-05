# ============================
# Embeddings Pipeline Dockerfile
# Multi-stage build with model pre-caching
# ============================

# ============================
# Stage 1: Builder (Dependencies + Model Cache)
# ============================
FROM python:3.10-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install to /install
COPY embeddings/requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# Set PYTHONPATH to find installed packages, then pre-download model
ENV PYTHONPATH="/install/lib/python3.10/site-packages:$PYTHONPATH"
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-large-en-v1.5')"

# ============================
# Stage 2: Runtime (Production)
# ============================
FROM python:3.10-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy model cache from builder (critical for performance)
COPY --from=builder /root/.cache /root/.cache

# Fix 4: Create embeddings directory and copy scripts there
RUN mkdir -p /app/embeddings

# Copy application code to embeddings subdirectory
COPY embeddings/*.py ./embeddings/

# Create data directories
RUN mkdir -p /app/local_data/gold /app/local_data/faiss