package jobs

import core.SparkBuilder
import config.AppConfig
import etl.raw.{RawReader, RawWriter}
import org.apache.spark.sql.functions._

object RawIngestionJob {

  def main(args: Array[String]): Unit = {

    val spark = SparkBuilder.get("RawIngestion")

    // Enable Delta Lake file recovery options
    spark.conf.set("spark.sql.files.ignoreMissingFiles", "true")
    spark.conf.set("spark.sql.files.ignoreCorruptFiles", "true")

    val inputPath  = AppConfig.RAW_INPUT
    val outputPath = AppConfig.RAW_INGESTED

    println(s"Reading RAW files from S3 → $inputPath")
    println(s"Writing extracted text to → $outputPath")

    val files = spark.sparkContext
      .binaryFiles(inputPath + "/*")
      .keys
      .collect()

    if (files.isEmpty) {
      println(s"❌ No files found in RAW folder: $inputPath")
      spark.stop()
      return
    }

    println(s"📄 Found ${files.length} files:")
    files.foreach(f => println(s" - $f"))

    val supported = Set("pdf", "txt", "json")

    val dfs = files.flatMap { file =>
      val ext = file.split("\\.").last.toLowerCase

      if (!supported.contains(ext)) {
        println(s"⚠️ Skipping unsupported file: $file")
        None
      } else {
        println(s"➡ Extracting: $file")
        Some(
          RawReader.read(
            spark,
            ext,
            file
          )
        )
      }
    }

    if (dfs.isEmpty) {
      println("❌ No valid files processed.")
      spark.stop()
      return
    }

    val finalDf = dfs
      .reduce(_ unionByName _)
      .withColumn("ingested_at", current_timestamp())   // DQ removed

    finalDf.show(50, truncate = false)

    RawWriter.write(finalDf, outputPath)

    println(s"✅ Raw ingestion completed successfully → $outputPath")
    spark.stop()
  }
}
