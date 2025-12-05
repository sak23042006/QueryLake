package config

object AppConfig {

  // S3 bucket root
  val bucket = "s3a://lakerag-arun-bootcamp"

  // RAW zone (uploaded files)
  val RAW_INPUT = s"$bucket/raw"                // user uploads go here

  // RAW_INGESTED zone (Delta extracted text)
  val RAW_INGESTED = s"$bucket/raw_ingested"    // our extracted dataset

  // SILVER zone
  val SILVER = s"$bucket/silver"

  // GOLD zone (vector embedding output)
  val GOLD = s"$bucket/gold"
}
