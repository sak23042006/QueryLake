package etl.raw

import org.apache.spark.sql.{DataFrame, SaveMode}
import org.apache.spark.sql.functions._

object RawWriter {

  def write(df: DataFrame, out: String): Unit = {

    val dqFail = df.filter(
      col("file_path").isNull ||
      col("content").isNull ||
      length(trim(col("content"))) < 1
    )

    val cleaned = df.filter(
      col("file_path").isNotNull &&
      col("content").isNotNull &&
      length(trim(col("content"))) > 0
    )

    // 🚀 SAFEST way for DQ check (NO full action)
    if (dqFail.head(1).nonEmpty) {
      val failCount = dqFail.count()  // action allowed here because write is not optimized away
      println(s"[RawWriter:DQ] ❌ Found $failCount bad rows, NOT writing them.")
      dqFail.show(false)
    }

    cleaned.write
      .format("delta")
      .mode(SaveMode.Overwrite)
      .option("overwriteSchema", "true")
      .save(out)

    println(s"[RawWriter] ✅ Successfully wrote ${cleaned.count()} rows to $out")
  }
}
