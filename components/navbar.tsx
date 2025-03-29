"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Inbox } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 right-0 left-0 z-10 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-blue-600">
              CV Tracker
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                pathname === "/"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>Inbox</span>
            </Link>
            <Link
              href="/archived"
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                pathname === "/archived"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Archive className="h-4 w-4" />
              <span>Archived</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
