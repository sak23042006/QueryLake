package etl.silver

import org.apache.spark.sql.{DataFrame, SaveMode}

object SilverWriter {

  def write(df: DataFrame, out: String): Unit = {
    if (df == null || df.isEmpty) return
    df.write
      .format("delta")
      .mode(SaveMode.Append)
      .save(out)
  }
}
