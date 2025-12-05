package core

import config.EnvLoader
import org.apache.spark.sql.SparkSession

object SparkBuilder {

  def get(appName: String = "Ingestion"): SparkSession = {

    // --------------------
    // Load .env into Scala
    // --------------------
    val env = EnvLoader.loadEnv()

    val accessKey = env.getOrElse("AWS_ACCESS_KEY_ID", "")
    val secretKey = env.getOrElse("AWS_SECRET_ACCESS_KEY", "")
    val region    = env.getOrElse("AWS_REGION", "us-east-1")

    println(s"[SparkBuilder] Using AWS key prefix: ${accessKey.take(4)}***")

    // --------------------
    // Build Spark Session
    // --------------------
    SparkSession.builder()
      .appName(appName)
      .master("local[*]")

      // --------------------
      // S3 CONFIG
      // --------------------
      .config("spark.hadoop.fs.s3a.access.key", accessKey)
      .config("spark.hadoop.fs.s3a.secret.key", secretKey)
      .config("spark.hadoop.fs.s3a.endpoint", s"s3.$region.amazonaws.com")

      .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
      .config("spark.hadoop.fs.s3a.path.style.access", "true")
      .config("spark.hadoop.fs.s3a.connection.ssl.enabled", "true")

      // AWS credential provider
      .config(
        "spark.hadoop.fs.s3a.aws.credentials.provider",
        "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider"
      )

      // Multipart upload for large PDFs
      .config("spark.hadoop.fs.s3a.multipart.size", 104857600) // 100MB

      // --------------------
      // DELTA CONFIG
      // --------------------
      .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
      .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")

      .getOrCreate()
  }
}
