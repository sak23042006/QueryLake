package etl.silver

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import java.util.UUID

object SilverTransformer {

  def transform(raw: DataFrame)(implicit spark: SparkSession): DataFrame = {

    import spark.implicits._

    // -------------------
    // DQ CHECK (MINIMAL)
    // -------------------
    val dqFiltered = raw
      .filter(col("file_path").isNotNull && length(trim(col("file_path"))) > 0)
      .filter(col("content").isNotNull)

    // 1) Normalize text: trim, collapse whitespace, lowercase, remove control chars + HTML
    val cleaned = dqFiltered
      .withColumn("content",
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                when(col("content").isNull, lit("")).otherwise(col("content")),
                "\\p{Cntrl}", " "
              ),
              "<[^>]*>", " "
            ),
            "&nbsp;", " "
          ),
          "\\s+", " "
        )
      )
      .withColumn("content", trim(lower(col("content"))))
      .withColumn("file_path", trim(col("file_path")))

    // 2) Remove empty content + add content hash
    val withHash = cleaned
      .filter(length(col("content")) > 0)
      .withColumn("content_hash", sha2(col("content"), 256))

    // 3) Deduplicate by content_hash
    val w = Window.partitionBy("content_hash").orderBy(col("ingested_at").desc)
    val deduped = withHash
      .withColumn("rn", row_number().over(w))
      .filter(col("rn") === 1)
      .drop("rn")

    // 4) Metadata enrichment
    val enriched = deduped
      .withColumn("doc_id", expr("uuid()"))
      .withColumn("silver_timestamp", current_timestamp())
      .withColumn("source_system", lit("LakeRAG-Scala-ETL"))
      .withColumn("language", lit("unknown"))

    enriched.select(
      col("doc_id"),
      col("file_path"),
      col("content"),
      col("ingested_at"),
      col("content_hash"),
      col("silver_timestamp"),
      col("source_system"),
      col("language")
    )
  }
}
