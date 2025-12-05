"use client";

import { useState, useEffect } from "react";
import { Trash2, RefreshCw, Loader2, File, FolderOpen } from "lucide-react";
import { api } from "@/lib/api";
import { S3File } from "@/types";

export default function FileManager() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.listFiles();
      setFiles(response.files);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete ${key}?`)) {
      return;
    }

    setDeleting(key);
    try {
      await api.deleteFile(key);
      setFiles(files.filter((f) => f.key !== key));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="text-blue-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">S3 Files Manager</h2>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <File className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No files found in S3 bucket</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <File className="text-gray-400" size={18} />
                      <span className="text-sm font-medium text-gray-900">
                        {file.key}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.lastModified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(file.key)}
                      disabled={deleting === file.key}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1 ml-auto"
                    >
                      {deleting === file.key ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 text-center">
        Total: {files.length} file{files.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
