"use client";

import CustomerOnboardingForm from "@/components/ui/CustomerOnboardingForm";
import JobPostingForm from "@/components/ui/JobPostingForm";
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
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <JobPostingForm />
          {/* <CustomerOnboardingForm /> */}
          {/* <ProfessionalOnboardingForm /> */}
        </div>
      </div>
    </Content>
  );
}
