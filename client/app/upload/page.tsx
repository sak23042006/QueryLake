import FileUploader from "@/components/FileUploader";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Upload Documents
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your documents to S3 for processing and analysis
          </p>
        </div>
        <FileUploader />
      </div>
    </div>
  );
}
