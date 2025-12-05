import Link from "next/link";
import { Search, FileText, Upload, FolderOpen, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Search,
      title: "Semantic Search",
      description: "Search through documents using natural language queries powered by AI embeddings",
      link: "/search",
      color: "blue",
    },
    {
      icon: FileText,
      title: "Smart Summarization",
      description: "Generate concise summaries from your documents automatically",
      link: "/summarize",
      color: "blue",
    },
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Upload documents to S3 with drag-and-drop simplicity",
      link: "/upload",
      color: "blue",
    },
    {
      icon: FolderOpen,
      title: "File Management",
      description: "View and manage all your documents in one place",
      link: "/files",
      color: "blue",
    },
  ];

  const highlights = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "FAISS-powered vector search for instant results",
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description: "AWS S3 for reliable and secure document storage",
    },
    {
      icon: Globe,
      title: "Scalable Architecture",
      description: "Built with Airflow, Spark, and modern microservices",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">LakeRAG</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A powerful document processing and retrieval system powered by AI.
            Search, summarize, and manage your documents with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/upload"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              Upload Documents
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.link}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-blue-300 group"
              >
                <div className={`mb-4 inline-block p-3 bg-${feature.color}-100 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-${feature.color}-600`} size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Highlights Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose LakeRAG?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div key={highlight.title} className="text-center">
                  <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                    <Icon size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{highlight.title}</h3>
                  <p className="text-blue-100">{highlight.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Powered by Modern Technologies
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-gray-600">
            <span className="px-4 py-2 bg-gray-100 rounded-full">Next.js</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">FastAPI</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">Apache Spark</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">Airflow</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">FAISS</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">AWS S3</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">Docker</span>
          </div>
        </div>
      </div>
    </div>
  );
}
