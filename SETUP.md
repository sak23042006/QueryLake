# 🚀 LakeRAG Setup Guide

**Quick Start Guide for New Users**

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Docker** 20.10+ installed
- [ ] **Docker Compose** 2.0+ installed
- [ ] **AWS CLI** 2.0+ configured
- [ ] **SBT** 1.9+ installed
- [ ] **Java JDK** 17+ installed
- [ ] **8GB+ RAM** available
- [ ] **20GB+ Disk Space** free
- [ ] **AWS S3 Bucket** created
- [ ] **Gemini API Key** obtained

---

## ⚡ Quick Start (5 Minutes)

### **1. Clone Repository**

```bash
git clone https://github.com/kalviumcommunity/LakeRAG_Arun-Kumar-S_Josys-Bootcamp.git
cd LakeRAG_Arun-Kumar-S_Josys-Bootcamp
```

### **2. Create Environment File**

```bash
cat > .env << 'EOF'
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1

# S3 Bucket
BUCKET_NAME=lakerag-arun-bootcamp

# Airflow Database
POSTGRES_USER=airflow
POSTGRES_PASSWORD=airflow
POSTGRES_DB=airflow

# Airflow Admin
AIRFLOW_ADMIN_USERNAME=admin
AIRFLOW_ADMIN_PASSWORD=admin
AIRFLOW_ADMIN_FIRSTNAME=Admin
AIRFLOW_ADMIN_LASTNAME=User
AIRFLOW_ADMIN_EMAIL=admin@example.com

# Airflow Security Keys
FERNET_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
SECRET_KEY=$(openssl rand -hex 16)

# Gemini API
GEMINI_API_KEY=AIza...

# Logging
LOG_LEVEL=info
EOF
```

**Important**: Replace `AKIA...`, `...`, and `AIza...` with your actual credentials.

### **3. Build Scala JAR**

```bash
cd scala-etl
sbt clean assembly
cd ..
```

**Expected**: JAR created at `scala-etl/target/scala-2.12/lakerag-etl.jar`

### **4. Upload Test Data**

```bash
# Create sample document
cat > test_data/sample.txt << 'EOF'
John Doe - Software Engineer
Skills: Python, Spark, Docker, AWS
Experience: 5 years in data engineering
EOF

# Upload to S3
aws s3 cp test_data/sample.txt s3://lakerag-arun-bootcamp/raw/
```

### **5. Start Services**

```bash
# Build images (takes 5-10 minutes)
docker-compose build

# Start all services
docker-compose up -d

# Wait for services to be ready
sleep 60
```

### **6. Verify Installation**

```bash
# Check services
docker-compose ps

# Test Airflow
curl http://localhost:8080/health

# Test Backend
curl http://localhost:8000/health
```

✅ **All services should show "Up" and health checks should pass!**

---

## 🔧 Detailed Setup

### **Step 1: Install Prerequisites**

#### **Docker & Docker Compose**

**Ubuntu/Debian**:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

**macOS**:
```bash
# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop from Applications
# Verify
docker --version
docker-compose --version
```

**Windows (WSL2)**:
```bash
# Install Docker Desktop for Windows
# Enable WSL2 integration in Docker Desktop settings
# Verify in WSL2 terminal
docker --version
docker-compose --version
```

---

#### **AWS CLI**

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Region: ap-south-1
# Output: json

# Verify
aws s3 ls
```

---

#### **SBT (Scala Build Tool)**

**Ubuntu/Debian**:
```bash
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt-get update
sudo apt-get install sbt

# Verify
sbt --version
```

**macOS**:
```bash
brew install sbt

# Verify
sbt --version
```

---

#### **Java JDK 17**

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc

# Verify
java -version
```

**macOS**:
```bash
brew install openjdk@17

# Link Java
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Verify
java -version
```

---

### **Step 2: AWS Setup**

#### **Create S3 Bucket**

```bash
# Create bucket
aws s3 mb s3://lakerag-arun-bootcamp --region ap-south-1

# Create folder structure
aws s3api put-object --bucket lakerag-arun-bootcamp --key raw/ --region ap-south-1
aws s3api put-object --bucket lakerag-arun-bootcamp --key raw_ingested/ --region ap-south-1
aws s3api put-object --bucket lakerag-arun-bootcamp --key silver/ --region ap-south-1
aws s3api put-object --bucket lakerag-arun-bootcamp --key gold/ --region ap-south-1
aws s3api put-object --bucket lakerag-arun-bootcamp --key gold-embeddings/ --region ap-south-1
aws s3api put-object --bucket lakerag-arun-bootcamp --key vector-index/ --region ap-south-1

# Verify
aws s3 ls s3://lakerag-arun-bootcamp/
```

#### **Create IAM Policy**

Save as `lakerag-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::lakerag-arun-bootcamp",
        "arn:aws:s3:::lakerag-arun-bootcamp/*"
      ]
    }
  ]
}
```

Create policy and user:
```bash
# Create policy
aws iam create-policy \
  --policy-name LakeRAGS3Access \
  --policy-document file://lakerag-policy.json

# Create user
aws iam create-user --user-name lakerag-user

# Attach policy to user
aws iam attach-user-policy \
  --user-name lakerag-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/LakeRAGS3Access

# Create access keys
aws iam create-access-key --user-name lakerag-user

# Save the AccessKeyId and SecretAccessKey for .env file
```

---

#### **Get Gemini API Key**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key (starts with `AIza...`)
4. Save for `.env` file

---

### **Step 3: Project Configuration**

#### **Clone Repository**

```bash
git clone https://github.com/kalviumcommunity/LakeRAG_Arun-Kumar-S_Josys-Bootcamp.git
cd LakeRAG_Arun-Kumar-S_Josys-Bootcamp
```

#### **Create `.env` File**

```bash
# Generate security keys first
FERNET_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
SECRET_KEY=$(openssl rand -hex 16)

# Create .env file
cat > .env << EOF
# ===========================
# AWS Credentials
# ===========================
AWS_ACCESS_KEY_ID=AKIA...              # Replace with your key
AWS_SECRET_ACCESS_KEY=...              # Replace with your secret
AWS_REGION=ap-south-1

# ===========================
# S3 Configuration
# ===========================
BUCKET_NAME=lakerag-arun-bootcamp

# ===========================
# Airflow Database
# ===========================
POSTGRES_USER=airflow
POSTGRES_PASSWORD=airflow
POSTGRES_DB=airflow

# ===========================
# Airflow Admin User
# ===========================
AIRFLOW_ADMIN_USERNAME=admin
AIRFLOW_ADMIN_PASSWORD=admin
AIRFLOW_ADMIN_FIRSTNAME=Admin
AIRFLOW_ADMIN_LASTNAME=User
AIRFLOW_ADMIN_EMAIL=admin@example.com

# ===========================
# Airflow Security Keys
# ===========================
FERNET_KEY=$FERNET_KEY
SECRET_KEY=$SECRET_KEY

# ===========================
# Gemini API
# ===========================
GEMINI_API_KEY=AIza...                 # Replace with your key

# ===========================
# Logging
# ===========================
LOG_LEVEL=info
EOF

# Verify file created
cat .env
```

---

### **Step 4: Build Scala ETL**

```bash
# Navigate to Scala project
cd scala-etl

# Clean previous builds
sbt clean

# Compile and build fat JAR
sbt assembly

# Verify JAR created (~50-80 MB)
ls -lh target/scala-2.12/lakerag-etl.jar

# Expected output:
# -rw-rw-r-- 1 user user 76M Dec  3 14:00 lakerag-etl.jar

# Return to project root
cd ..
```

**Troubleshooting**:

If build fails with memory error:
```bash
# Increase SBT memory
export SBT_OPTS="-Xmx2G -XX:+UseConcMarkSweepGC"
sbt clean assembly
```

---

### **Step 5: Prepare Test Data**

```bash
# Create test data directory
mkdir -p test_data

# Create sample resume
cat > test_data/john_doe_resume.txt << 'EOF'
John Doe
Senior Software Engineer

Professional Summary:
Results-driven software engineer with 5+ years of experience in data engineering, 
machine learning, and cloud infrastructure. Proven track record of building 
scalable ETL pipelines and RAG systems.

Technical Skills:
- Programming: Python, Scala, SQL, Java
- Frameworks: Apache Spark, Delta Lake, FastAPI, Flask
- Cloud: AWS (S3, EMR, Lambda, EC2), Azure
- Data: Spark SQL, Delta Lake, Parquet, Avro
- ML: Sentence Transformers, FAISS, LangChain, HuggingFace
- DevOps: Docker, Kubernetes, Airflow, Jenkins

Work Experience:

Senior Data Engineer | Tech Corp | 2021 - Present
- Built ETL pipelines processing 10TB+ data daily using Spark and Delta Lake
- Implemented real-time streaming solutions with Kafka and Spark Streaming
- Deployed microservices on AWS EKS, reducing infrastructure costs by 40%
- Led team of 4 engineers in developing ML feature store

Data Engineer | StartupXYZ | 2019 - 2021
- Developed data lakehouse architecture on Delta Lake
- Created automated ML pipelines for customer segmentation
- Optimized Spark jobs, achieving 50% cost reduction
- Built RESTful APIs for data access using FastAPI

Junior Developer | Software Inc | 2018 - 2019
- Developed backend services using Python and Flask
- Maintained PostgreSQL databases
- Wrote automated tests using pytest

Education:
Bachelor of Technology in Computer Science
Indian Institute of Technology (IIT) Delhi, 2018
GPA: 8.5/10

Certifications:
- AWS Certified Solutions Architect
- Apache Spark Developer Certification
- Google Cloud Professional Data Engineer

Projects:
- LakeRAG: Built RAG system with semantic search using FAISS and Gemini
- DataPipeline: Automated ETL framework processing 1M+ records/hour
- RealtimeML: Real-time prediction API serving 10K+ requests/second
EOF

# Create another sample
cat > test_data/jane_smith_resume.txt << 'EOF'
Jane Smith
Machine Learning Engineer

Summary:
ML Engineer specializing in NLP and computer vision. 
Experience building production ML systems at scale.

Skills:
Python, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy
AWS SageMaker, MLflow, DVC

Experience:
ML Engineer at AI Company (2020-Present)
- Developed NLP models for document classification
- Deployed ML models on SageMaker
- Built feature engineering pipelines

Education:
MS in Computer Science, Stanford University, 2020
EOF

# Upload to S3
aws s3 cp test_data/john_doe_resume.txt s3://lakerag-arun-bootcamp/raw/
aws s3 cp test_data/jane_smith_resume.txt s3://lakerag-arun-bootcamp/raw/

# Verify upload
aws s3 ls s3://lakerag-arun-bootcamp/raw/
```

**Expected Output**:
```
2024-12-03 14:30:00       1523 john_doe_resume.txt
2024-12-03 14:30:01        642 jane_smith_resume.txt
```

---

### **Step 6: Build Docker Images**

```bash
# Build all services
docker-compose build

# This takes 5-10 minutes on first run
# Expected output:
# Building airflow
# Building backend
# Building embeddings
```

**Monitor Build Progress**:
```bash
# In another terminal, watch Docker
watch -n 2 'docker images | grep lakerag'
```

**Verify Images Built**:
```bash
docker images | grep lakerag

# Expected output:
# lakerag-airflow                                    latest    abc123    5 min ago    2.93GB
# lakerag_arun-kumar-s_josys-bootcamp_embeddings     latest    def456    8 min ago    5.37GB
# lakerag_arun-kumar-s_josys-bootcamp_backend        latest    ghi789    3 min ago    4.58GB
```

**Troubleshooting Builds**:

If build fails with timeout:
```bash
# Increase timeout
COMPOSE_HTTP_TIMEOUT=600 docker-compose build
```

If build fails with disk space:
```bash
# Clean up old images
docker system prune -a

# Free up space
docker builder prune -f
```

---

### **Step 7: Start Services**

```bash
# Start all services in background
docker-compose up -d

# Expected output:
# Creating network "lakerag_default" with the default driver
# Creating postgres ... done
# Creating spark ... done
# Creating spark-worker ... done
# Creating airflow-init ... done
# Creating airflow-scheduler ... done
# Creating airflow-webserver ... done
# Creating backend ... done
```

**Monitor Startup**:
```bash
# Watch services start
watch -n 2 'docker-compose ps'

# Wait until all show "Up" (takes ~2 minutes)
```

**Expected Service Status**:
```
NAME                     STATUS
postgres                 Up
spark                    Up
spark-worker             Up
airflow-webserver        Up (healthy)
airflow-scheduler        Up
backend                  Up
```

---

### **Step 8: Verify Installation**

#### **Check Service Health**

```bash
# Airflow UI
curl -s http://localhost:8080/health | jq

# Expected: {"metadatabase":{"status":"healthy"},...}

# Backend API
curl http://localhost:8000/health

# Expected: {"status":"ok"}

# Spark Master
curl -s http://localhost:8081 | grep "Spark Master"

# Expected: <title>Spark Master at spark://...</title>
```

#### **Test Service Access**

```bash
# Test Airflow login
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/login/

# Expected: 200

# Test Backend docs
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs

# Expected: 200
```

#### **Check Logs for Errors**

```bash
# Check all services
docker-compose logs | grep -i error

# If no errors, you're good to go!
```

---

### **Step 9: Access Airflow UI**

1. **Open Browser**: http://localhost:8080
2. **Login Credentials**:
   - **Username**: `admin` (from `.env` AIRFLOW_ADMIN_USERNAME)
   - **Password**: `admin` (from `.env` AIRFLOW_ADMIN_PASSWORD)
3. **Verify DAGs**:
   - Should see `lakerag_etl_pipeline`
   - Should see `test_embeddings_only`

---

### **Step 10: Run Test Pipeline**

#### **Trigger ETL Pipeline**

1. In Airflow UI, click on **`lakerag_etl_pipeline`**
2. Click ▶️ **"Trigger DAG"**
3. Click **"Trigger"** to confirm
4. **Watch Execution** (~7-10 minutes):
   - `raw_ingestion` → Green (2 min)
   - `raw_to_silver` → Green (1 min)
   - `silver_to_gold` → Green (2 min)
   - `generate_embeddings` → Green (3 min)
   - `build_faiss_index` → Green (30 sec)

#### **Verify Outputs**

```bash
# Check Delta tables
aws s3 ls s3://lakerag-arun-bootcamp/gold/_delta_log/

# Check embeddings
aws s3 ls s3://lakerag-arun-bootcamp/gold-embeddings/

# Check FAISS index
aws s3 ls s3://lakerag-arun-bootcamp/vector-index/
```

#### **Test Search API**

```bash
# Wait for backend to download index (~1 minute)
docker-compose logs -f backend | grep "Search service ready"

# Test semantic search
curl -X POST http://localhost:8000/search/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the technical skills?",
    "k": 3
  }' | jq

# Expected: JSON with search results
```

#### **Test Summarization**

```bash
curl -X POST http://localhost:8000/summarize/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize work experience"
  }' | jq

# Expected: JSON with AI-generated summary
```

---

## ✅ Installation Complete!

### **What You've Built**

- ✅ **Spark Cluster**: Master + Worker for distributed processing
- ✅ **Airflow**: Workflow orchestration with 2 DAGs
- ✅ **Delta Lake**: 3-layer lakehouse (Raw → Silver → Gold)
- ✅ **Embeddings**: BGE-large-en-v1.5 model for semantic search
- ✅ **FAISS Index**: Vector database for similarity search
- ✅ **FastAPI Backend**: Search & summarization APIs
- ✅ **Test Data**: 2 sample resumes processed

### **Next Steps**

1. **Upload Your Documents**:
```bash
aws s3 cp your_file.pdf s3://lakerag-arun-bootcamp/raw/
```

2. **Trigger Pipeline** in Airflow UI

3. **Query Your Data**:
```bash
curl -X POST http://localhost:8000/search/ \
  -H "Content-Type: application/json" \
  -d '{"query": "your question", "k": 5}'
```

4. **Explore Airflow**:
   - View task logs
   - Monitor execution times
   - Create new DAGs

5. **Read Full Documentation**:
   - [DOCUMENTATION.md](DOCUMENTATION.md) - Complete guide
   - [API.md](API.md) - API reference (if created)
   - [RUNBOOK.md](RUNBOOK.md) - Operations guide (if created)

---

## 🔧 Maintenance

### **Stop Services**

```bash
docker-compose down
```

### **Stop & Remove Data**

```bash
docker-compose down -v  # Removes volumes (deletes DB)
```

### **Restart Services**

```bash
docker-compose restart
```

### **Update Code**

```bash
# Update Scala
cd scala-etl && sbt clean assembly && cd ..

# Rebuild images
docker-compose build

# Restart
docker-compose up -d
```

### **View Logs**

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs -f airflow-scheduler

# Filter errors
docker-compose logs | grep ERROR
```

---

## 🆘 Common Issues

### **Issue: Port Already in Use**

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### **Issue: Out of Disk Space**

```bash
# Clean Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

### **Issue: Services Won't Start**

```bash
# Check logs
docker-compose logs

# Restart with fresh state
docker-compose down -v
docker-compose up -d
```

### **Issue: Can't Access Airflow UI**

```bash
# Check if webserver is running
docker-compose ps airflow-webserver

# Check logs
docker-compose logs airflow-webserver

# Restart
docker-compose restart airflow-webserver
```

---

## 📚 Resources

- **Full Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **Troubleshooting**: See DOCUMENTATION.md Section 9
- **Project Repository**: https://github.com/kalviumcommunity/LakeRAG_Arun-Kumar-S_Josys-Bootcamp
- **Report Issues**: Open GitHub issue with logs

---

## 🎉 Success!

Your LakeRAG system is now ready to process documents, generate embeddings, and provide intelligent search & summarization!

**Happy Building! 🚀**
