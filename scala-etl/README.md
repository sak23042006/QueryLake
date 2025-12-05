 # LakeRAG — Scala ETL Module

 Delta Lake ETL pipelines for Raw → Silver → Gold layers.

 ## Overview

 This folder contains the Scala + Spark + Delta Lake ETL pipelines used in the LakeRAG system. The ETL flow converts raw input files (PDFs, TXT, JSON) into cleaned Silver datasets and chunked Gold datasets that feed the embeddings pipeline for semantic search and RAG.

 ## ETL Jobs

 ### 1. **RawIngestionJob** (`jobs.RawIngestionJob`)
 
 Extracts text from various file formats and writes to Delta Lake.
 
 - **Input**: S3 bucket raw files (`s3://lakerag-arun-bootcamp/raw/`)
 - **Formats Supported**: PDF (Apache PDFBox), TXT (UTF-8), JSON (Spark native)
 - **Output**: Delta Lake table at `s3://lakerag-arun-bootcamp/raw_ingested/`
 - **Schema**: `file_path`, `content`, `file_type`, `ingested_at`

 ### 2. **RawToSilverJob** (`jobs.RawToSilverJob`)
 
 Cleans, validates, and deduplicates raw data.
 
 - **Input**: `raw_ingested/` Delta table
 - **Transformations**:
   - Remove null/empty content
   - Clean HTML tags and special characters
   - Normalize whitespace
   - SHA-256 content hashing for deduplication
 - **Output**: Delta Lake table at `s3://lakerag-arun-bootcamp/silver/`
 - **Schema**: `doc_id`, `file_path`, `content`, `content_hash`, `silver_timestamp`

 ### 3. **SilverToGoldJob** (`jobs.SilverToGoldJob`)
 
 Chunks documents into fixed-size segments for embeddings.
 
 - **Input**: `silver/` Delta table
 - **Transformations**:
   - Split content into 500-character chunks
   - Preserve document metadata
   - Generate unique chunk IDs
 - **Output**: Delta Lake table at `s3://lakerag-arun-bootcamp/gold/`
 - **Schema**: `chunk_id`, `doc_id`, `file_path`, `chunk_text`, `chunk_index`, `content_hash`, `gold_timestamp`

 ## Project Structure

 ```text
 scala-etl/
   ├── src/main/scala/
   │   ├── jobs/              # ETL job entry points
   │   │   ├── RawIngestionJob.scala
   │   │   ├── RawToSilverJob.scala
   │   │   └── SilverToGoldJob.scala
   │   ├── ingestion/         # Raw data extractors
   │   │   ├── PDFExtractor.scala
   │   │   ├── TextExtractor.scala
   │   │   └── JSONExtractor.scala
   │   ├── etl/               # Transformation logic
   │   │   ├── RawToSilverTransformer.scala
   │   │   └── SilverToGoldTransformer.scala
   │   ├── schema/            # Case classes & schemas
   │   │   ├── RawSchema.scala
   │   │   ├── SilverSchema.scala
   │   │   └── GoldSchema.scala
   │   ├── config/            # Configuration management
   │   │   └── S3Config.scala
   │   └── core/              # Spark session & utilities
   │       └── SparkSessionProvider.scala
   ├── target/scala-2.12/
   │   └── lakerag-etl.jar    # Assembled fat JAR
   ├── build.sbt              # SBT build configuration
   └── README.md              # This file
 ```

 ## Technology Stack

 - **Scala**: 2.12.18
 - **Apache Spark**: 3.5.0
 - **Delta Lake**: 3.2.0
 - **Hadoop AWS**: 3.3.4 (S3 integration)
 - **Apache PDFBox**: 2.0.27 (PDF parsing)
 - **SBT**: 1.9+

 ## Running the ETL Jobs

 ### Method 1: Via Airflow (Recommended)

 The Airflow DAG `lakerag_etl_pipeline` orchestrates all jobs in sequence:

 1. Open Airflow UI at http://localhost:8080
 2. Trigger the `lakerag_etl_pipeline` DAG
 3. Monitor task execution in real-time

 ### Method 2: Manual Execution with SBT

 ```bash
 cd scala-etl

 # Step 1: Raw Ingestion
 sbt "runMain jobs.RawIngestionJob"

 # Step 2: Raw to Silver Transformation
 sbt "runMain jobs.RawToSilverJob"

 # Step 3: Silver to Gold Chunking
 sbt "runMain jobs.SilverToGoldJob"
 ```

 ### Method 3: Submit to Spark Cluster

 ```bash
 # Build fat JAR
 sbt clean assembly

 # Submit to Spark
 spark-submit \
   --class jobs.RawIngestionJob \
   --master spark://spark:7077 \
   --driver-memory 2g \
   --executor-memory 2g \
   target/scala-2.12/lakerag-etl.jar
 ```

 ## Configuration

 ### AWS Credentials

 Set environment variables or configure `~/.aws/credentials`:

 ```bash
 export AWS_ACCESS_KEY_ID=your_access_key
 export AWS_SECRET_ACCESS_KEY=your_secret_key
 export AWS_REGION=ap-south-1
 ```

 ### S3 Bucket

 Update `src/main/scala/config/S3Config.scala` with your bucket name:

 ```scala
 object S3Config {
   val bucketName = "lakerag-arun-bootcamp"
   val rawPath = s"s3a://$bucketName/raw/"
   val silverPath = s"s3a://$bucketName/silver/"
   val goldPath = s"s3a://$bucketName/gold/"
 }
 ```

 ## Building the Project

 ```bash
 # Compile only
 sbt compile

 # Run tests
 sbt test

 # Build fat JAR (includes all dependencies)
 sbt clean assembly

 # JAR output location:
 # target/scala-2.12/lakerag-etl.jar
 ```

 ## Data Flow

 ```text
 S3 Raw Files (PDF/TXT/JSON)
       ↓
 [RawIngestionJob] → Extract text content
       ↓
 raw_ingested/ (Delta Lake)
       ↓
 [RawToSilverJob] → Clean, dedupe, validate
       ↓
 silver/ (Delta Lake)
       ↓
 [SilverToGoldJob] → Chunk into 500-char segments
       ↓
 gold/ (Delta Lake)
       ↓
 [Python Embeddings Pipeline] → Generate vectors
       ↓
 FAISS Index → Semantic search
 ```

 ## Delta Lake Features

 - **ACID Transactions**: Ensures data consistency across concurrent writes
 - **Time Travel**: Query historical versions of data
 - **Schema Evolution**: Add/modify columns without breaking existing queries
 - **Upserts**: Efficiently merge new data with existing records

 ## Troubleshooting

 ### Common Issues

 **1. S3 Access Denied**
 ```bash
 # Verify AWS credentials
 aws s3 ls s3://lakerag-arun-bootcamp/

 # Check IAM permissions (requires s3:GetObject, s3:PutObject, s3:ListBucket)
 ```

 **2. JAR Not Found**
 ```bash
 # Rebuild JAR
 sbt clean assembly

 # Verify output
 ls -lh target/scala-2.12/lakerag-etl.jar
 ```

 **3. Out of Memory**
 ```bash
 # Increase SBT memory in project/build.properties
 # Add: -Xmx4G -Xms1G
 ```

 ## Next Steps

 After running the ETL pipeline:

 1. **Generate Embeddings**: Run `embeddings/generate_embeddings.py`
 2. **Build FAISS Index**: Run `embeddings/build_faiss_index.py`
 3. **Query Data**: Use FastAPI backend at `http://localhost:8000/search`

 ## Resources

 - **Delta Lake Docs**: https://docs.delta.io/
 - **Spark SQL Guide**: https://spark.apache.org/docs/latest/sql-programming-guide.html
 - **PDFBox API**: https://pdfbox.apache.org/

 ---

 **Last Updated**: December 2025  
 **Maintainer**: Arun Kumar S