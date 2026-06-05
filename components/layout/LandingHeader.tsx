// components/layout/LandingHeader.tsx
"use client";

import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";

export default function LandingHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/header-logo.png"
            alt="aykau Logo"
            width={120}
            height={40}
            priority
            className="object-contain"
          />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard/jobs"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Find Jobs
          </Link>
          <Link
            href="/dashboard/my-requests"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Post a Job
          </Link>
          <Button
            type="primary"
            className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-lg !h-9 !px-5"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}
