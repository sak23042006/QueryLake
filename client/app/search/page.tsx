import SearchBar from "@/components/SearchBar";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Semantic Search
          </h1>
          <p className="text-gray-600 text-lg">
            Search through your documents using natural language queries
          </p>
        </div>
        <SearchBar />
      </div>
    </div>
  );
}
