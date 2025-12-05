from airflow import DAG
from airflow.providers.docker.operators.docker import DockerOperator
from airflow.models import Variable
from datetime import datetime
import os

default_args = {"owner": "airflow", "retries": 1}

# Get local data path from Airflow Variable for portability
# Default points to project directory (update via Airflow UI for other environments)
LOCAL_DATA_PATH = Variable.get(
    "LAKERAG_LOCAL_DATA_PATH",
    default_var="/home/sak23/Desktop/Projects/Josys-Bootcamp/LakeRAG_Arun-Kumar-S_Josys-Bootcamp/local_data"
)

# Get AWS credentials from environment (should be set in docker-compose.yml)
def get_aws_env():
    return {
        "AWS_ACCESS_KEY_ID": os.environ.get("AWS_ACCESS_KEY_ID", ""),
        "AWS_SECRET_ACCESS_KEY": os.environ.get("AWS_SECRET_ACCESS_KEY", ""),
        "AWS_REGION": os.environ.get("AWS_REGION", "ap-south-1"),
        "PYTHONUNBUFFERED": "1",
    }

with DAG(
    dag_id="test_embeddings_only",
    start_date=datetime(2024, 1, 1),
    schedule_interval=None,
    catchup=False,
    default_args=default_args,
    description="Test only embeddings + FAISS (skip Scala jobs)",
    tags=["test", "embeddings"],
):

    generate_embeddings = DockerOperator(
        task_id="generate_embeddings",
        image="lakerag_arun-kumar-s_josys-bootcamp_embeddings:latest",
        container_name="test_embeddings_{{ ts_nodash }}",
        api_version="auto",
        auto_remove="success",
        force_pull=False,
        docker_url="unix://var/run/docker.sock",
        working_dir="/app/embeddings",
        command="python generate_embeddings.py",
        mounts=[
            {"source": LOCAL_DATA_PATH, "target": "/app/local_data", "type": "bind"},
        ],
        environment=get_aws_env(),
        mount_tmp_dir=False,
    )

    build_faiss_index = DockerOperator(
        task_id="build_faiss_index",
        image="lakerag_arun-kumar-s_josys-bootcamp_embeddings:latest",
        container_name="test_faiss_{{ ts_nodash }}",
        api_version="auto",
        auto_remove="success",
        force_pull=False,
        docker_url="unix://var/run/docker.sock",
        working_dir="/app/embeddings",
        command="python build_faiss_index.py",
        mounts=[
            {"source": LOCAL_DATA_PATH, "target": "/app/local_data", "type": "bind"},
        ],
        environment=get_aws_env(),
        mount_tmp_dir=False,
    )

    generate_embeddings >> build_faiss_index