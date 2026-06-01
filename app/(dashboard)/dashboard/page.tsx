// app/dashboard/page.tsx (or pages/dashboard/index.tsx)
"use client";

import { useState, useEffect } from "react";
import {
  Layout,
  Alert,
  Modal,
  Button,
  Spin,
  Tag,
  Typography,
  Card,
} from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import ArtisanOnboardingForm from "@/components/ui/ArtisanOnboardingForm";
import CustomerOnboardingForm from "@/components/ui/CustomerOnboardingForm";

const { Content } = Layout;
const { Text, Title, Paragraph } = Typography;

type OnboardingStatus = {
  needsOnboarding: boolean;
  currentRole: "artisan" | "customer" | null;
  completedRoles: string[];
  profileLoaded: boolean;
};

export default function Dashboard() {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    needsOnboarding: false,
    currentRole: null,
    completedRoles: [],
    profileLoaded: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔍 Fetch profile & check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "current_active_role, completed_onboarding_roles, is_verified"
          )
          .eq("id", user.id)
          .maybeSingle();

        const currentRole = profile?.current_active_role as
          | "artisan"
          | "customer"
          | null;
        const completedRoles = profile?.completed_onboarding_roles || [];

        const needsOnboarding =
          currentRole && !completedRoles.includes(currentRole);

        setOnboardingStatus({
          needsOnboarding: !!needsOnboarding,
          currentRole,
          completedRoles,
          profileLoaded: true,
        });
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // 🔄 Refresh status after onboarding completes
  const handleOnboardingComplete = async () => {
    setIsModalOpen(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_active_role, completed_onboarding_roles")
      .eq("id", user.id)
      .maybeSingle();

    setOnboardingStatus((prev) => ({
      ...prev,
      needsOnboarding: false,
      currentRole: profile?.current_active_role as
        | "artisan"
        | "customer"
        | null,
      completedRoles: profile?.completed_onboarding_roles || [],
    }));
  };

  // 🎨 Styles (inline for now - clean & scoped)
  const styles = {
    alert: {
      marginBottom: 24,
      borderRadius: 12,
      border: "1px solid #fcd34d",
      background: "#fffbeb",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    alertAction: {
      background: "#f59e0b",
      borderColor: "#f59e0b",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 16px",
      marginBottom: 24,
      background: "#f0fdf4",
      border: "1px solid #86efac",
      borderRadius: 12,
      color: "#166534",
      fontSize: 14,
    },
    contentCard: {
      borderRadius: 16,
      padding: 24,
      minHeight: 400,
      background: "#fff",
      border: "1px solid #f1f5f9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    },
    placeholderCard: {
      padding: 20,
      borderRadius: 12,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      marginBottom: 12,
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
      paddingBottom: 16,
      borderBottom: "1px solid #f1f5f9",
    },
    skipButton: {
      color: "#94a3b8",
    },
  } as const;

  // 🎨 Render loading state
  if (loading) {
    return (
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" description="Loading your dashboard..." />
      </Content>
    );
  }

  // 🎨 Render main content
  return (
    <Content style={{ padding: "24px 48px" }}>
      {/* 🚨 Onboarding Alert Banner */}
      {onboardingStatus.needsOnboarding && !isAlertDismissed && (
        <Alert
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ExclamationCircleOutlined
                style={{ color: "#f59e0b", fontSize: 18 }}
              />
              <Text strong>
                Complete your{" "}
                <Text style={{ textTransform: "capitalize", color: "#b45309" }}>
                  {onboardingStatus.currentRole}
                </Text>{" "}
                profile to get started
              </Text>
            </div>
          }
          description={
            <Paragraph style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
              {onboardingStatus.currentRole === "artisan"
                ? "Add your skills, experience, and location to start receiving job requests."
                : "Tell us what services you need and your preferences to find the right professionals."}
            </Paragraph>
          }
          type="warning"
          showIcon={false}
          style={styles.alert}
          action={
            <Button
              type="primary"
              size="small"
              onClick={() => setIsModalOpen(true)}
              style={styles.alertAction}
            >
              Complete Profile
            </Button>
          }
          closable
          onClose={() => setIsAlertDismissed(true)}
        />
      )}

      {/* ✅ Onboarding Complete Badge */}
      {!onboardingStatus.needsOnboarding && onboardingStatus.profileLoaded && (
        <div style={styles.badge}>
          <CheckCircleOutlined />
          <span>
            Profile complete •{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {onboardingStatus.currentRole}
            </strong>
          </span>
          {onboardingStatus.completedRoles.length > 1 && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              +{onboardingStatus.completedRoles.length - 1} role
              {onboardingStatus.completedRoles.length > 2 ? "s" : ""}
            </Tag>
          )}
        </div>
      )}

      {/* 📦 Dashboard Content Area */}
      <Card style={styles.contentCard} variant="borderless">
        <Title level={4} style={{ margin: "0 0 8px 0" }}>
          Welcome back 👋
        </Title>
        <Paragraph style={{ color: "#64748b", margin: "0 0 24px 0" }}>
          {onboardingStatus.needsOnboarding
            ? "Complete your profile to unlock all features."
            : "Here's what's happening with your account."}
        </Paragraph>

        {/* 🧩 Placeholder widgets */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.placeholderCard}>
              <div
                style={{
                  height: 16,
                  width: 100,
                  background: "#e2e8f0",
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "100%",
                  background: "#f1f5f9",
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "75%",
                  background: "#f1f5f9",
                  borderRadius: 4,
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* 🪟 Onboarding Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
        centered
        closeIcon={<CloseOutlined style={{ color: "#94a3b8" }} />}
        mask={{ closable: false }} // ✅ Replaces deprecated maskClosable
        styles={{
          body: { padding: 0 }, // ✅ 'content' removed → use 'body'
          header: { display: "none" },
        }}
      >
        {/* Wrapper handles border radius & overflow since we can't style 'content' directly in v5 */}
        <div
          style={{ borderRadius: 16, overflow: "hidden", background: "#fff" }}
        >
          <div style={{ padding: "24px 32px" }}>
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Complete Profile
                </Title>
                <Paragraph
                  style={{
                    margin: "4px 0 0 0",
                    color: "#64748b",
                    fontSize: 14,
                  }}
                >
                  This usually takes 2-3 minutes
                </Paragraph>
              </div>
              <Button
                type="text"
                size="small"
                onClick={() => setIsModalOpen(false)}
                style={{ color: "#94a3b8" }}
              >
                Skip for now
              </Button>
            </div>

            {/* 🔄 Render the correct onboarding form */}
            {onboardingStatus.currentRole === "artisan" ? (
              <ArtisanOnboardingForm onComplete={handleOnboardingComplete} />
            ) : onboardingStatus.currentRole === "customer" ? (
              <CustomerOnboardingForm onComplete={handleOnboardingComplete} />
            ) : (
              <div
                style={{ textAlign: "center", padding: 40, color: "#64748b" }}
              >
                No active role selected. Please contact support.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Content>
  );
}
