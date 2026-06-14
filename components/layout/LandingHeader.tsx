// components/layout/LandingHeader.tsx
"use client";

import { Button } from "antd";
import Image from "next/image";
import Link from "next/link";

export default function LandingHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #c7c5d3", // outline-variant
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max, 1440px)",
          margin: "0 auto",
          padding: "0 var(--margin-desktop, 40px)",
          height: "64px", // 8 * 8 base unit
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="responsive-padding" // optional class for mobile override
      >
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0 }}>
          <Image
            src="/header-logo.png"
            alt="aykau Logo"
            width={120}
            height={40}
            priority
            style={{ objectFit: "contain" }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px", // 3 * 8px
          }}
          className="hidden md:flex"
        >
          <Link
            href="/dashboard/jobs"
            style={{
              fontSize: "0.875rem", // label-md / 14px
              fontWeight: 500,
              color: "#464651", // on-surface-variant
              transition: "color 0.2s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#15196c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#464651")}
          >
            Find Jobs
          </Link>
          <Link
            href="/dashboard/my-requests"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#464651",
              transition: "color 0.2s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#15196c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#464651")}
          >
            Post a Job
          </Link>
          <Link href="/dashboard">
            <Button
              type="primary"
              style={{
                height: 36,
                padding: "0 20px",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: 8,
              }}
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile responsive override for padding */}
      <style jsx>{`
        @media (max-width: 767px) {
          .responsive-padding {
            padding: 0 var(--margin-mobile, 16px) !important;
          }
        }
      `}</style>
    </header>
  );
}
