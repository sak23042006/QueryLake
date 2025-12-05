package schema

import java.sql.Timestamp

case class SilverRecord(
  doc_id: String,
  file_path: String,
  content: String,
  ingested_at: Timestamp,
  content_hash: String,
  silver_timestamp: Timestamp,
  source_system: String,
  language: String
)
