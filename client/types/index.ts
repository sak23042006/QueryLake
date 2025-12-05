export interface SearchResult {
  rank: number;
  score: number;
  doc_id: string;
  chunk_index: number;
  text: string;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
  message?: string;
}

export interface SummarizeResponse {
  query: string | null;
  doc_id: string;
  chunks_used: number;
  summary: string;
}

export interface S3File {
  key: string;
  size: number;
  lastModified: Date;
}

export interface S3ListResponse {
  files: S3File[];
}

export interface UploadResponse {
  success: boolean;
  key: string;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
