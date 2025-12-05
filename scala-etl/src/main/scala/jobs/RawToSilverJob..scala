package jobs

import core.SparkBuilder
import config.AppConfig
import etl.silver.{SilverTransformer, SilverWriter}
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._

object RawToSilverJob {

  def main(args: Array[String]): Unit = {

    implicit val spark: SparkSession = SparkBuilder.get("RawToSilver")

    // Enable Delta Lake file recovery options
    spark.conf.set("spark.sql.files.ignoreMissingFiles", "true")
    spark.conf.set("spark.sql.files.ignoreCorruptFiles", "true")

    val rawPath    = AppConfig.RAW_INGESTED
    val silverPath = AppConfig.SILVER

    println(s"📥 Reading RAW_INGESTED Delta: $rawPath")
    println(s"📤 Writing SILVER Delta: $silverPath")

    val rawDf = spark.read.format("delta").load(rawPath)

    println(s"RAW_INGESTED Schema:")
    rawDf.printSchema()

    val silverDf = SilverTransformer.transform(rawDf)
      .filter(col("file_path").isNotNull && col("content").isNotNull)   // <-- DQ ADDED

    println("SILVER Preview:")
    silverDf.show(20, truncate = false)

    SilverWriter.write(silverDf, silverPath)

    println(s"✅ Silver layer generated successfully → $silverPath")
    spark.stop()
  }
}
