// components/layout/LandingFooter.tsx
"use client";

import { Typography } from "antd";
import Image from "next/image";
import Link from "next/link";

const { Text } = Typography;

export default function LandingFooter() {
  return (
    <footer
      style={{
        background: "#ffffff", // surface-container-lowest
        borderTop: "1px solid #c7c5d3", // outline-variant
        padding: "3rem 1.5rem", // 48px 24px (base units: 6*8px, 3*8px)
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max, 1440px)",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem", // 24px = 3*8px
        }}
        className="footer-row"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Image
            src="/header-logo.png"
            alt="aykau Logo"
            width={100}
            height={32}
            style={{
              objectFit: "contain",
              opacity: 0.8,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          />
        </div>

        {/* Copyright */}
        <Text
          style={{
            fontSize: "0.875rem", // label-md
            color: "#777682", // outline
          }}
        >
          © {new Date().getFullYear()} aykau. All rights reserved.
        </Text>

        {/* Footer Links */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem", // 24px = 3*8px
          }}
        >
          <Link
            href="/privacy"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#464651", // on-surface-variant
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#15196c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#464651")}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#464651",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#15196c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#464651")}
          >
            Terms
          </Link>
          <Link
            href="/support"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#464651",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#15196c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#464651")}
          >
            Support
          </Link>
        </div>
      </div>

      {/* Responsive breakpoint: switch to row layout on desktop */}
      <style jsx>{`
        @media (min-width: 768px) {
          .footer-row {
            flex-direction: row !important;
          }
        }
      `}</style>
    </footer>
  );
}
