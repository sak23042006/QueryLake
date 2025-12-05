"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { SearchResult } from "@/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [k, setK] = useState(5);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await api.search(query, k);
      setResults(response.results);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to perform search");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white placeholder:text-gray-400"
          />
          <input
            type="number"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value) || 5)}
            min="1"
            max="20"
            className="w-20 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-gray-900 bg-white"
            title="Number of results"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Searching...
              </>
            ) : (
              <>
                <Search size={20} />
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div className="mt-6 p-8 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Found {results.length} results for &quot;{query}&quot;
          </h2>
          {results.map((result, index) => (
            <div
              key={`${result.doc_id}-${result.chunk_index}-${index}`}
              className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    Rank {result.rank}
                  </span>
                  <span className="text-sm text-gray-500">
                    Score: {result.score.toFixed(4)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Doc: {result.doc_id} | Chunk: {result.chunk_index}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
