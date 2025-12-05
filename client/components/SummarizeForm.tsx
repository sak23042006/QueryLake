"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function SummarizeForm() {
  const [query, setQuery] = useState("");
  const [docId, setDocId] = useState("");
  const [k, setK] = useState(5);
  const [summary, setSummary] = useState("");
  const [chunksUsed, setChunksUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summarized, setSummarized] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() && !docId.trim()) {
      setError("Please provide either a query or a document ID");
      return;
    }

    setLoading(true);
    setError("");
    setSummarized(true);

    try {
      const response = await api.summarize(
        query.trim() || undefined,
        docId.trim() || undefined,
        k
      );
      setSummary(response.summary);
      setChunksUsed(response.chunks_used);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate summary");
      setSummary("");
      setChunksUsed(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSummarize} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Query (optional)
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a query to find relevant documents..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
          />
        </div>

        <div className="text-center text-gray-500 font-medium">OR</div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document ID (optional)
          </label>
          <input
            type="text"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="Enter specific document ID..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of chunks (k)
            </label>
            <input
              type="number"
              value={k}
              onChange={(e) => setK(parseInt(e.target.value) || 5)}
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating...
              </>
            ) : (
              <>
                <FileText size={20} />
                Summarize
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {summarized && !loading && !summary && !error && (
        <div className="mt-6 p-8 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
          No summary generated. Please check your inputs.
        </div>
      )}

      {summary && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
            <span className="text-sm text-gray-500">
              Based on {chunksUsed} chunks
            </span>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
