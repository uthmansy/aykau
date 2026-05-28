"use client";

import ProfessionalOnboardingForm from "@/components/ui/ProfessionalOnboardingForm";
import { Layout, Breadcrumb, theme } from "antd";

const { Content } = Layout;

export default function Dashboard() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Content style={{ padding: "0 48px" }}>
      <div
        style={{
          background: colorBgContainer,
          minHeight: 280,
          padding: 24,
          borderRadius: borderRadiusLG,
        }}
      >
        <ProfessionalOnboardingForm />
      </div>
    </Content>
  );
}
