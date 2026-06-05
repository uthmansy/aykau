// components/layout/LandingFooter.tsx
"use client";

import { Typography } from "antd";
import Image from "next/image";

const { Text } = Typography;

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Image
            src="/header-logo.png"
            alt="aykau Logo"
            width={100}
            height={32}
            className="object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
        <Text className="!text-sm !text-gray-400">
          © {new Date().getFullYear()} aykau. All rights reserved.
        </Text>
        <div className="flex gap-6">
          <a
            href="/privacy"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Terms
          </a>
          <a
            href="/support"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
