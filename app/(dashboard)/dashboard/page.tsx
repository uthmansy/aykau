"use client";

import { useState } from "react";
import CustomerOnboardingForm from "@/components/ui/CustomerOnboardingForm";
import JobPostingForm from "@/components/ui/JobPostingForm";
import ProfessionalOnboardingForm from "@/components/ui/ProfessionalOnboardingForm";
import { Layout, Button, Modal, theme } from "antd";
import { PlusOutlined, RiseOutlined } from "@ant-design/icons";

const { Content } = Layout;

export default function Dashboard() {
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
        <ProfessionalOnboardingForm />
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
