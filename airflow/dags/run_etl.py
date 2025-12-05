from airflow import DAG
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from airflow.providers.docker.operators.docker import DockerOperator
from airflow.models import Variable
from datetime import datetime
import os

# Shared configuration
default_args = {"owner": "airflow", "retries": 1}

# Get local data path from Airflow Variable for portability
# Default points to project directory (update via Airflow UI for other environments)
LOCAL_DATA_PATH = Variable.get(
    "LAKERAG_LOCAL_DATA_PATH",
    default_var="/home/sak23/Desktop/Projects/Josys-Bootcamp/LakeRAG_Arun-Kumar-S_Josys-Bootcamp/local_data"
)

# Get AWS credentials from environment
def get_aws_env():
    return {
        "AWS_ACCESS_KEY_ID": os.environ.get("AWS_ACCESS_KEY_ID", ""),
        "AWS_SECRET_ACCESS_KEY": os.environ.get("AWS_SECRET_ACCESS_KEY", ""),
        "AWS_REGION": os.environ.get("AWS_REGION", "ap-south-1"),
        "PYTHONUNBUFFERED": "1",
    }

# AWS credentials for Spark (evaluated at parse time)
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

# Shared Spark configuration
SPARK_CONF = {
    "spark.master": "spark://spark:7077",
    "spark.executor.memory": "2g",
    "spark.driver.memory": "1g",
    "spark.hadoop.fs.s3a.access.key": AWS_ACCESS_KEY_ID,
    "spark.hadoop.fs.s3a.secret.key": AWS_SECRET_ACCESS_KEY,
    "spark.hadoop.fs.s3a.endpoint": f"s3.{AWS_REGION}.amazonaws.com",
    "spark.hadoop.fs.s3a.impl": "org.apache.hadoop.fs.s3a.S3AFileSystem",
    "spark.hadoop.fs.s3a.aws.credentials.provider": "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider",
}

# Shared Spark packages
SPARK_PACKAGES = "io.delta:delta-spark_2.12:3.2.0,org.apache.hadoop:hadoop-aws:3.3.4,com.amazonaws:aws-java-sdk-bundle:1.12.673"

# Shared application path
SPARK_APP = "/opt/etl/lakerag-etl.jar"

with DAG(
    dag_id="lakerag_etl_pipeline",
    start_date=datetime(2024, 1, 1),
    schedule_interval=None,
    catchup=False,
    default_args=default_args,
    description="LakeRAG ETL: Raw → Silver → Gold → Embeddings → FAISS",
    tags=["lakerag", "etl", "delta-lake"],
):

    # ------------------ Scala ETL tasks ------------------
    raw_ingestion = SparkSubmitOperator(
        task_id="raw_ingestion",
        application=SPARK_APP,
        conn_id="spark_default",
        conf=SPARK_CONF,
        java_class="jobs.RawIngestionJob",
        packages=SPARK_PACKAGES,
        verbose=True,
    )

    raw_to_silver = SparkSubmitOperator(
        task_id="raw_to_silver",
        application=SPARK_APP,
        conn_id="spark_default",
        conf=SPARK_CONF,
        java_class="jobs.RawToSilverJob",
        packages=SPARK_PACKAGES,
        verbose=True,
    )

    silver_to_gold = SparkSubmitOperator(
        task_id="silver_to_gold",
        application=SPARK_APP,
        conn_id="spark_default",
        conf=SPARK_CONF,
        java_class="jobs.SilverToGoldJob",
        packages=SPARK_PACKAGES,
        verbose=True,
    )

    # ------------------ Python embeddings tasks (using DockerOperator) ------------------
    generate_embeddings = DockerOperator(
        task_id="generate_embeddings",
        image="lakerag_arun-kumar-s_josys-bootcamp_embeddings:latest",
        container_name="embeddings_generate_{{ ts_nodash }}",
        api_version="auto",
        auto_remove="success",
        force_pull=False,
        working_dir="/app/embeddings",
        command="python generate_embeddings.py",
        docker_url="unix://var/run/docker.sock",
        environment=get_aws_env(),
        mounts=[
            {"source": LOCAL_DATA_PATH, "target": "/app/local_data", "type": "bind"},
        ],
        mount_tmp_dir=False,
    )

    build_faiss_index = DockerOperator(
        task_id="build_faiss_index",
        image="lakerag_arun-kumar-s_josys-bootcamp_embeddings:latest",
        container_name="embeddings_faiss_{{ ts_nodash }}",
        api_version="auto",
        auto_remove="success",
        force_pull=False,
        working_dir="/app/embeddings",
        command="python build_faiss_index.py",
        docker_url="unix://var/run/docker.sock",
        environment=get_aws_env(),
        mounts=[
            {"source": LOCAL_DATA_PATH, "target": "/app/local_data", "type": "bind"},
        ],
        mount_tmp_dir=False,
    )

    # ------------------ DAG flow ------------------
    raw_ingestion >> raw_to_silver >> silver_to_gold >> generate_embeddings >> build_faiss_index
