package ingestion

import org.apache.spark.sql.{DataFrame, SparkSession}
import java.sql.Timestamp
import java.time.Instant
import org.apache.spark.sql.functions._

object JsonExtractor {

  def extract(spark: SparkSession, path: String): DataFrame = {
    import spark.implicits._

    val ts = Timestamp.from(Instant.now())

    val files = spark.sparkContext.binaryFiles(path).map {
      case (filePath, content) =>
        val rawJson = new String(content.toArray(), "UTF-8")
        (filePath, rawJson, ts)
    }.toDF("file_path", "content", "ingested_at")

    // DQ: ensure file_path & content are not null
    files.filter(col("file_path").isNotNull && col("content").isNotNull)
  }
}
