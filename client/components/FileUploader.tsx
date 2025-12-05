"use client";

import { useState, useRef } from "react";
import { Upload, File, Loader2, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function FileUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowed = new Set(["pdf", "txt", "json"]);

  const isAllowedFile = (file: File | null) => {
    if (!file) return false;
    const name = file.name || "";
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return allowed.has(ext);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!isAllowedFile(file)) {
        setError("Unsupported file type. Only PDF, TXT and JSON are allowed.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setSuccess(false);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }
    if (!isAllowedFile(selectedFile)) {
      setError("Unsupported file type. Only PDF, TXT and JSON are allowed.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      await api.uploadFile(selectedFile);
      setSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0] || null;
    if (file) {
      if (!isAllowedFile(file)) {
        setError("Unsupported file type. Only PDF, TXT and JSON are allowed.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setSuccess(false);
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your file here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Support for PDF, TXT and JSON document formats
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFile && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="text-blue-600" size={24} />
            <div>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload
              </>
            )}
          </button>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          File uploaded successfully to S3!
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <XCircle size={20} />
          {error}
        </div>
      )}
    </div>
  );
}
