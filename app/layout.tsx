import ThemeProvider from "@/components/providers/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
import "antd/dist/reset.css";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
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
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
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
