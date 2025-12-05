package schema

import java.sql.Timestamp

case class GoldRecord(
  chunk_id: String,
  doc_id: String,
  file_path: String,
  chunk_text: String,
  chunk_index: Int,
  content_hash: String,
  ingested_at: Timestamp,
  gold_timestamp: Timestamp
)
