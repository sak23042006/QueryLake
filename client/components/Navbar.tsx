"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, FileText, Upload, FolderOpen, Home } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/summarize", label: "Summarize", icon: FileText },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/files", label: "Files", icon: FolderOpen },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            <span>LakeRAG</span>
          </Link>
          <div className="flex space-x-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  pathname === href
                    ? "bg-white text-blue-600 font-semibold shadow-md"
                    : "hover:bg-blue-700 text-white"
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
