package jobs

import core.SparkBuilder
import config.AppConfig
import etl.gold.{GoldTransformer, GoldWriter}
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._

object SilverToGoldJob {

  def main(args: Array[String]): Unit = {

    val spark = SparkBuilder.get("SilverToGold")

    // Enable Delta Lake file recovery options
    spark.conf.set("spark.sql.files.ignoreMissingFiles", "true")
    spark.conf.set("spark.sql.files.ignoreCorruptFiles", "true")

    val silverPath = AppConfig.SILVER
    val goldPath   = AppConfig.GOLD

    println(s"Reading SILVER: $silverPath")
    println(s"Writing GOLD:  $goldPath")

    val silverDf = spark.read.format("delta").load(silverPath)

    val silverClean = silverDf
      .filter(col("doc_id").isNotNull && col("content").isNotNull)   // <-- DQ ADDED

    val goldDf = GoldTransformer.transform(silverClean)(spark)

    goldDf.show(50, truncate = false)

    GoldWriter.write(goldDf, goldPath)

    println(s"✅ Gold layer generated successfully → $goldPath")

    spark.stop()
  }
}
