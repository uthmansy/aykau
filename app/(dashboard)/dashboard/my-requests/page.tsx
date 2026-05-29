"use client";

import { useState } from "react";
import CustomerOnboardingForm from "@/components/ui/CustomerOnboardingForm";
import JobPostingForm from "@/components/ui/JobPostingForm";
import ProfessionalOnboardingForm from "@/components/ui/ProfessionalOnboardingForm";
import { Layout, Button, Modal, theme } from "antd";
import { PlusOutlined, RiseOutlined } from "@ant-design/icons";

const { Content } = Layout;

export default function MyRequests() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    token: {
      colorBgContainer,
      borderRadiusLG,
      colorPrimary,
      colorTextSecondary,
    },
  } = theme.useToken();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <Content style={{ padding: "0 48px" }}>
      <div
        style={{
          background: colorBgContainer,
          minHeight: 280,
          padding: 24,
          borderRadius: borderRadiusLG,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* ✨ Modern Hero Section */}
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                background: `${colorPrimary}15`,
                borderRadius: 100,
                marginBottom: 16,
                fontSize: 14,
                color: colorPrimary,
                fontWeight: 500,
              }}
            >
              <RiseOutlined />
              Get things done, faster
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: 28,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              What do you need help with today?
            </h1>

            <p
              style={{
                margin: "0 0 24px",
                color: colorTextSecondary,
                fontSize: 16,
              }}
            >
              Post a request and get matched with verified professionals in
              minutes.
            </p>

            {/* 🎯 Primary CTA Button */}
            <Button
              type="primary"
              size="large"
              onClick={showModal}
              icon={<PlusOutlined />}
              style={{
                height: 48,
                padding: "0 32px",
                fontSize: 16,
                fontWeight: 500,
                borderRadius: 12,
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
                transition: "all 0.2s ease",
              }}
            >
              Post a Job Request
            </Button>

            {/* Secondary actions */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                size="middle"
                style={{ borderRadius: 10 }}
                onClick={() => console.log("browse professionals")}
              >
                Browse Professionals
              </Button>
              <Button
                size="middle"
                style={{ borderRadius: 10 }}
                onClick={() => console.log("view my requests")}
              >
                My Requests
              </Button>
            </div>
          </div>

          {/* Optional: Recent Activity / Placeholder */}
          <div
            style={{
              marginTop: 32,
              padding: "20px",
              background: `${colorBgContainer}`,
              borderRadius: 12,
              border: `1px dashed ${colorTextSecondary}20`,
            }}
          >
            <p
              style={{
                margin: 0,
                color: colorTextSecondary,
                textAlign: "center",
              }}
            >
              Your recent requests will appear here 👇
            </p>
          </div>
        </div>
      </div>

      {/* 🪟 Modern Modal for Job Posting */}
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={900}
        centered
        closeIcon={null}
        styles={{
          body: {
            padding: 0,
            maxHeight: "85vh",
            overflowY: "auto",
          },
          header: {
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
          },
        }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${colorPrimary}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colorPrimary,
              }}
            >
              <PlusOutlined />
            </div>
            <span style={{ fontWeight: 600, fontSize: 18 }}>
              Post a New Request
            </span>
          </div>
        }
      >
        <div style={{ padding: "20px 24px" }}>
          <JobPostingForm />
        </div>
      </Modal>
    </Content>
  );
}
