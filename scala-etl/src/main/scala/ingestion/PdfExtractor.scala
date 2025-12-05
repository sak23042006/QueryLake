package ingestion

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.text.PDFTextStripper
import java.sql.Timestamp
import java.time.Instant
import org.apache.spark.sql.functions._

object PdfExtractor {

  def extract(spark: SparkSession, path: String): DataFrame = {
    import spark.implicits._

    val ts = Timestamp.from(Instant.now())

    val files = spark.sparkContext.binaryFiles(path).map {
      case (filePath, content) =>
        val bytes = content.toArray()
        val pdf   = PDDocument.load(bytes)
        val text  =
          try new PDFTextStripper().getText(pdf)
          finally pdf.close()

        (filePath, text, ts)
    }.toDF("file_path", "content", "ingested_at")

    files.filter(col("file_path").isNotNull && col("content").isNotNull)
  }
}
