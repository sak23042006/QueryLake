 # LakeRAG — RAG Lakehouse System (Josys Bootcamp)

 A production-grade Lakehouse pipeline for document ingestion, transformation, and RAG-ready retrieval with semantic search and AI summarization.

 ## Overview

 LakeRAG is a complete end-to-end RAG (Retrieval-Augmented Generation) system built on modern data lakehouse architecture. It processes unstructured documents (PDFs, TXT, JSON) through a multi-stage ETL pipeline, generates semantic embeddings, and provides intelligent search and summarization capabilities through a web interface.

 ## System Components

 - **Delta Lake ETL** - Multi-stage data transformation (Raw → Silver → Gold)
 - **Apache Airflow** - Workflow orchestration and scheduling
 - **Embeddings Pipeline** - BGE-large-en-v1.5 model for semantic vectors
 - **FAISS Vector Index** - High-performance similarity search
 - **FastAPI Backend** - REST APIs for search and summarization
 - **Next.js Frontend** - Modern web interface for document management
 - **Docker Compose** - Full containerized deployment

 This repository contains all modules in a single monorepo.

 ## Architecture

 ```text
 ┌─────────────┐      ┌──────────────┐      ┌─────────────┐
 │  Frontend   │─────▶│   Backend    │─────▶│     S3      │
 │  (Next.js)  │      │  (FastAPI)   │      │  (Storage)  │
 └─────────────┘      └──────────────┘      └─────────────┘
                             │                      │
                             ▼                      ▼
                      ┌──────────────┐      ┌─────────────┐
                      │ FAISS Index  │      │  Delta Lake │
                      │  (Vectors)   │      │    (Gold)   │
                      └──────────────┘      └─────────────┘
                             ▲                      ▲
                             │                      │
                      ┌──────────────┐      ┌─────────────┐
                      │  Embeddings  │◀─────│   Airflow   │
                      │   Pipeline   │      │     ETL     │
                      └──────────────┘      └─────────────┘
 ```

 ## Monorepo Structure

 ```text
 ├── client/              # Next.js 14 frontend application
 │   ├── app/            # App Router pages (search, upload, files)
 │   ├── components/     # React components
 │   └── lib/            # API client utilities
 ├── backend/            # FastAPI REST API
 │   ├── api/            # Endpoints (search, summarize)
 │   └── services/       # Business logic
 ├── scala-etl/          # Scala + Spark + Delta ETL jobs
 │   └── src/main/scala/
 │       └── jobs/       # RawIngestionJob, RawToSilverJob, SilverToGoldJob
 ├── embeddings/         # Python embeddings + FAISS indexing
 │   ├── generate_embeddings.py
 │   └── build_faiss_index.py
 ├── airflow/            # Orchestration DAGs
 │   └── dags/           # ETL pipeline workflows
 ├── local_data/         # Local data cache
 │   ├── faiss/          # Vector index files
 │   └── gold/           # Delta Lake tables
 └── test_data/          # Sample documents for testing
 ```

 ## Technology Stack

 | Layer | Technology | Purpose |
 |-------|-----------|---------|
 | **Frontend** | Next.js 14, TypeScript, Tailwind CSS | Web UI |
 | **Backend** | FastAPI, Python 3.10 | REST APIs |
 | **ETL** | Scala 2.12, Apache Spark 3.5 | Data processing |
 | **Storage** | AWS S3, Delta Lake 3.2 | Data lake |
 | **Vectors** | BGE-large-en-v1.5, FAISS | Semantic search |
 | **LLM** | Google Gemini 2.0 Flash | Summarization |
 | **Orchestration** | Apache Airflow 2.8 | Workflow management |
 | **Deployment** | Docker Compose | Containerization |

 ## Quick Start

 ### Prerequisites
 - Docker & Docker Compose
 - AWS CLI configured
 - SBT & Java 17+ (for Scala development)
 - Node.js 20+ (for frontend development)
 - 8GB+ RAM, 20GB+ disk space

 ### 1. Clone & Setup

 ```bash
 git clone https://github.com/kalviumcommunity/LakeRAG_Arun-Kumar-S_Josys-Bootcamp.git
 cd LakeRAG_Arun-Kumar-S_Josys-Bootcamp

 # Create environment file (see .env.example)
 cp .env.example .env
 # Edit .env with your AWS and Gemini API credentials
 ```

 ### 2. Build & Start Services

 ```bash
 # Build Scala JAR
 cd scala-etl && sbt clean assembly && cd ..

 # Start all services
 docker-compose up -d
 ```

 ### 3. Access Applications

 - **Frontend**: http://localhost:3000
 - **Airflow**: http://localhost:8080 (admin/admin)
 - **Backend API**: http://localhost:8000/docs
 - **Spark UI**: http://localhost:8081

 ## Key Features

 ### 🔍 **Semantic Search**
 Search through documents using natural language queries with AI-powered embeddings.

 ### 📝 **AI Summarization**
 Generate concise summaries of documents using Google Gemini 2.0.

 ### 📤 **Document Upload**
 Drag-and-drop interface for uploading PDFs, text files, and JSON documents.

 ### 📁 **File Management**
 View, manage, and delete documents from your S3 bucket.

 ### 🔄 **Automated ETL**
 Airflow-orchestrated pipeline automatically processes new documents.

 ## Running the Pipeline

 ### Via Airflow UI (Recommended)
 1. Open http://localhost:8080
 2. Navigate to `lakerag_etl_pipeline` DAG
 3. Click "Trigger DAG" to start processing

 ### Manual Scala Jobs
 ```bash
 cd scala-etl
 # Raw ingestion
 sbt "runMain jobs.RawIngestionJob"
 # Raw to Silver transformation
 sbt "runMain jobs.RawToSilverJob"
 # Silver to Gold chunking
 sbt "runMain jobs.SilverToGoldJob"
 ```

 ### Manual Embeddings
 ```bash
 docker-compose run embeddings python generate_embeddings.py
 docker-compose run embeddings python build_faiss_index.py
 ```

 ## Documentation

 - **[SETUP.md](SETUP.md)** - Detailed installation guide
 - **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete system documentation
 - **[DOCKER_OPTIMIZATION.md](DOCKER_OPTIMIZATION.md)** - Docker optimization details
 - **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines
 - **[client/README.md](client/README.md)** - Frontend documentation
 - **[scala-etl/README.md](scala-etl/README.md)** - ETL job documentation

 ## Project Status

 **Version**: 1.0.0 (December 2025)

 - ✅ Complete Scala ETL pipeline with Delta Lake
 - ✅ Semantic embeddings with BGE-large-en-v1.5
 - ✅ FAISS vector indexing for fast retrieval
 - ✅ FastAPI backend with search & summarization
 - ✅ Next.js frontend with full file management
 - ✅ Airflow orchestration
 - ✅ Docker Compose deployment
 - ✅ Production-ready with health checks

 ## Contributing

 See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

 ## License

 This project is part of the Kalvium Josys Bootcamp program.

## Contact

**Author**: Arun Kumar S  
**Email**: arun.ofc09@gmail.com  
**Repository**: https://githubcomkalviumcommunityLakeRAG_Arun-Kumar-S_Josys-Bootcamp