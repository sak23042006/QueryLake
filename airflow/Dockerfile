# ============================
# Airflow Dockerfile (Optimized)
# Only JRE for spark-submit client
# ============================

FROM apache/airflow:2.8.1-python3.10

USER root

# Install minimal JRE for spark-submit (not full Spark!)
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME for spark-submit
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

USER airflow

# Install Python dependencies
COPY airflow/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt \
    --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.8.1/constraints-3.10.txt"
