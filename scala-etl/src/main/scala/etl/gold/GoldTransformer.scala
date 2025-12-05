package etl.gold

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._

object GoldTransformer {

  private def chunkText(text: String, chunkSize: Int = 500): Seq[(String, Int)] = {
    if (text == null || text.trim.isEmpty) Seq.empty
    else text.grouped(chunkSize).zipWithIndex.toSeq
  }

  def transform(silver: DataFrame)(implicit spark: SparkSession): DataFrame = {

    import spark.implicits._

    // Minimal DQ
    val dq = silver
      .filter(col("doc_id").isNotNull && length(trim(col("doc_id"))) > 0)
      .filter(col("file_path").isNotNull && length(trim(col("file_path"))) > 0)
      .filter(col("content").isNotNull)

    val chunkUDF =
      udf((content: String) => chunkText(content))

    dq.withColumn("chunk_struct", explode(chunkUDF(col("content"))))
      .select(
        expr("uuid()").as("chunk_id"),
        col("doc_id"),
        col("file_path"),
        col("chunk_struct._1").as("chunk_text"),
        col("chunk_struct._2").as("chunk_index"),
        col("content_hash"),
        col("ingested_at"),
        current_timestamp().as("gold_timestamp")
      )
  }
}
