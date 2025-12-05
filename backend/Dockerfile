# -------------------------
# FastAPI Backend Dockerfile
# Multi-stage build for optimal size
# -------------------------

# ============================
# Stage 1: Builder (Dependencies)
# ============================
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies (only in builder stage)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install to /install
COPY backend/requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# Add installed packages to Python path and pre-download model
ENV PYTHONPATH="/install/lib/python3.12/site-packages:$PYTHONPATH"
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-large-en-v1.5')"

# ============================
# Stage 2: Runtime (Production)
# ============================
FROM python:3.12-slim

WORKDIR /app

# Python runtime optimization flags
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install only runtime dependencies (no build tools)
RUN apt-get update && apt-get install -y \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy ONLY the model cache (not pip cache or other artifacts)
COPY --from=builder /root/.cache/huggingface /root/.cache/huggingface

# Copy backend code
COPY backend/ /app/backend/

# Create directories for runtime data (populated via volume mounts)
RUN mkdir -p /app/local_data/runtime /app/local_data/faiss

EXPOSE 8000

# Start uvicorn directly
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
