package etl.gold

import org.apache.spark.sql.{DataFrame, SaveMode}

object GoldWriter {

  def write(df: DataFrame, out: String): Unit = {
    if (df == null || df.isEmpty) return
    df.write
      .format("delta")
      .mode(SaveMode.Append)
      .save(out)
  }
}
