import ThemeProvider from "@/components/providers/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
import "antd/dist/reset.css";
import type { Metadata } from "next";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aykau",
  description: "Aykau",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AntdRegistry>
          <ThemeProvider>
            <App>{children}</App>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
