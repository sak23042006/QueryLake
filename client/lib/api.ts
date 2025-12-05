import axios from "axios";
import { SearchResponse, SummarizeResponse, S3ListResponse, UploadResponse, DeleteResponse } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const api = {
  // Semantic Search
  search: async (query: string, k: number = 5): Promise<SearchResponse> => {
    const response = await axios.post(`${BACKEND_URL}/search/`, { query, k });
    return response.data;
  },

  // Document Summarization
  summarize: async (
    query?: string,
    doc_id?: string,
    k: number = 5
  ): Promise<SummarizeResponse> => {
    const response = await axios.post(`${BACKEND_URL}/summarize/`, {
      query: query || null,
      doc_id: doc_id || null,
      k,
    });
    return response.data;
  },

  // S3 File Management (via Next.js API routes)
  listFiles: async (): Promise<S3ListResponse> => {
    const response = await axios.get("/api/s3/list");
    return response.data;
  },

  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post("/api/s3/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteFile: async (key: string): Promise<DeleteResponse> => {
    const response = await axios.delete("/api/s3/delete", { data: { key } });
    return response.data;
  },
};
