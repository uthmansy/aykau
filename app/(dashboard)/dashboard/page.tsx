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
  Row,
  Col,
  List,
  Empty,
} from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  UserOutlined,
  FileTextOutlined,
  WalletOutlined,
  PlusOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import ArtisanOnboardingForm from "@/components/ui/ArtisanOnboardingForm";
import CustomerOnboardingForm from "@/components/ui/CustomerOnboardingForm";
import Link from "next/link";

const { Content } = Layout;
const { Text, Title, Paragraph } = Typography;

type UserRole = "artisan" | "customer" | "admin" | null;

type OnboardingStatus = {
  needsOnboarding: boolean;
  currentRole: UserRole;
  completedRoles: string[];
  profileLoaded: boolean;
  fullName: string;
};

type DashboardStats = {
  primaryMetric: number;
  secondaryMetric: number;
  walletBalance: number;
};

export default function Dashboard() {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    needsOnboarding: false,
    currentRole: null,
    completedRoles: [],
    profileLoaded: false,
    fullName: "",
  });

  const [stats, setStats] = useState<DashboardStats>({
    primaryMetric: 0,
    secondaryMetric: 0,
    walletBalance: 0,
  });
  const [recentItems, setRecentItems] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Fetch Profile & Onboarding Status
        const { data: profile } = await supabase
          .from("profiles")
          .select("current_active_role, completed_onboarding_roles, full_name")
          .eq("id", user.id)
          .maybeSingle();

        const currentRole = profile?.current_active_role as UserRole;
        const completedRoles = profile?.completed_onboarding_roles || [];
        const needsOnboarding = currentRole
          ? !completedRoles.includes(currentRole)
          : false;

        setOnboardingStatus({
          needsOnboarding,
          currentRole,
          completedRoles,
          profileLoaded: true,
          fullName: profile?.full_name || "there",
        });

        // 2. Fetch Dashboard Stats & Recent Items if onboarding is complete
        if (currentRole && !needsOnboarding) {
          await fetchDashboardData(user.id, currentRole);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const fetchDashboardData = async (userId: string, role: UserRole) => {
    try {
      // Fetch Wallet Balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("fiat_balance")
        .eq("user_id", userId)
        .maybeSingle();

      let primaryMetric = 0;
      let secondaryMetric = 0;
      let items: any[] = [];

      if (role === "customer") {
        // Customer Stats
        const [{ count: activeJobs }, { count: pendingQuotes }] =
          await Promise.all([
            supabase
              .from("job_requests")
              .select("*", { count: "exact", head: true })
              .eq("customer_id", userId)
              .in("status", ["open", "quoting"]),
            supabase
              .from("job_quotes")
              .select("*", { count: "exact", head: true })
              .eq("customer_id", userId)
              .eq("status", "pending"),
          ]);

        primaryMetric = activeJobs || 0;
        secondaryMetric = pendingQuotes || 0;

        // Recent Jobs
        const { data: jobs } = await supabase
          .from("job_requests")
          .select("id, title, status, quote_count, created_at")
          .eq("customer_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        items = jobs || [];
      } else if (role === "artisan") {
        // Artisan Stats
        const [{ count: sentQuotes }, { count: activeContracts }] =
          await Promise.all([
            supabase
              .from("job_quotes")
              .select("*", { count: "exact", head: true })
              .eq("artisan_id", userId),
            supabase
              .from("contracts")
              .select("*", { count: "exact", head: true })
              .eq("artisan_id", userId)
              .eq("status", "active"),
          ]);

        primaryMetric = sentQuotes || 0;
        secondaryMetric = activeContracts || 0;

        // Recent Quotes
        const { data: quotes } = await supabase
          .from("job_quotes")
          .select(
            `
            id, 
            status, 
            quoted_price, 
            created_at,
            job:job_requests(title)
          `
          )
          .eq("artisan_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        items = quotes || [];
      }

      setStats({
        primaryMetric,
        secondaryMetric,
        walletBalance: wallet?.fiat_balance || 0,
      });
      setRecentItems(items);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setIsModalOpen(false);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_active_role, completed_onboarding_roles")
      .eq("id", user.id)
      .maybeSingle();

    const currentRole = profile?.current_active_role as UserRole;

    setOnboardingStatus((prev) => ({
      ...prev,
      needsOnboarding: false,
      currentRole,
      completedRoles: profile?.completed_onboarding_roles || [],
    }));

    await fetchDashboardData(user.id, currentRole);
  };

  if (loading) {
    return (
      <Content className="!flex !items-center !justify-center !min-h-[60vh]">
        <Spin size="large" />
        <Text className="!ml-4 !text-on-surface-variant">
          Loading your dashboard...
        </Text>
      </Content>
    );
  }

  const isCustomer = onboardingStatus.currentRole === "customer";
  const isArtisan = onboardingStatus.currentRole === "artisan";

  return (
    <Content className="!p-6 !max-w-[1440px] !mx-auto">
      {/* 🚨 Onboarding Alert */}
      {onboardingStatus.needsOnboarding && !isAlertDismissed && (
        <Alert
          className="!mb-6 !rounded-[0.75rem] !border-warning !bg-warning/10"
          message={
            <div className="!flex !items-center !gap-3">
              <ExclamationCircleOutlined className="!text-warning !text-lg" />
              <Text strong className="!text-on-surface">
                Complete your{" "}
                <Text strong className="!capitalize !text-warning">
                  {onboardingStatus.currentRole}
                </Text>{" "}
                profile to get started
              </Text>
            </div>
          }
          description={
            <Paragraph className="!mb-0 !ml-7 !text-on-surface-variant !text-sm">
              {isArtisan
                ? "Add your skills, experience, and location to start receiving job requests."
                : "Tell us what services you need and your preferences to find the right professionals."}
            </Paragraph>
          }
          type="warning"
          showIcon={false}
          action={
            <Button
              type="primary"
              size="middle"
              onClick={() => setIsModalOpen(true)}
              className="!bg-secondary !border-secondary !hover:!bg-secondary-container !hover:!border-secondary-container !rounded-[0.5rem] !font-semibold"
            >
              Complete Profile
            </Button>
          }
          closable
          onClose={() => setIsAlertDismissed(true)}
          closeIcon={<CloseOutlined className="!text-on-surface-variant" />}
        />
      )}

      {/* 👋 Welcome Header */}
      <div className="!mb-8">
        <Title
          level={2}
          className="!mb-2 !font-manrope !text-on-surface !font-bold"
        >
          Welcome back, {onboardingStatus.fullName.split(" ")[0]} 👋
        </Title>
        <Paragraph className="!text-on-surface-variant !text-base !mb-0">
          {onboardingStatus.needsOnboarding
            ? "Complete your profile to unlock all features."
            : "Here's an overview of your activity and quick actions."}
        </Paragraph>
      </div>

      {/* 📊 Stats Grid */}
      {!onboardingStatus.needsOnboarding && (
        <Row gutter={[24, 24]} className="!mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="!rounded-[1rem] border-none! !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !h-full"
              styles={{ body: { padding: "24px" } }}
            >
              <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-2">
                {isCustomer ? "Active Jobs" : "Quotes Sent"}
              </Text>
              <div className="!flex !items-end !gap-2">
                <Title
                  level={2}
                  className="!mb-0 !font-manrope !text-on-surface !font-bold"
                >
                  {stats.primaryMetric}
                </Title>
                <UserOutlined className="!text-primary !text-xl !mb-1" />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className="!rounded-[1rem] border-none! !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !h-full"
              styles={{ body: { padding: "24px" } }}
            >
              <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-2">
                {isCustomer ? "Pending Quotes" : "Active Contracts"}
              </Text>
              <div className="!flex !items-end !gap-2">
                <Title
                  level={2}
                  className="!mb-0 !font-manrope !text-on-surface !font-bold"
                >
                  {stats.secondaryMetric}
                </Title>
                <FileTextOutlined className="!text-tertiary !text-xl !mb-1" />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className="!rounded-[1rem] border-none! !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !h-full"
              styles={{ body: { padding: "24px" } }}
            >
              <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-2">
                Wallet Balance
              </Text>
              <div className="!flex !items-end !gap-2">
                <Title
                  level={2}
                  className="!mb-0 !font-manrope !text-on-surface !font-bold"
                >
                  ₦{stats.walletBalance.toLocaleString()}
                </Title>
                <WalletOutlined className="!text-success !text-xl !mb-1" />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className="!rounded-[1rem] border-none! !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !h-full"
              styles={{
                body: {
                  padding: "24px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                },
              }}
            >
              <div>
                <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-2">
                  Quick Actions
                </Text>
                <Paragraph className="!text-sm !text-on-surface-variant !mb-4">
                  {isCustomer
                    ? "Need a service? Post a job now."
                    : "Looking for work? Browse jobs."}
                </Paragraph>
              </div>
              <Link
                href={
                  isCustomer ? "/dashboard/my-requests/new" : "/dashboard/jobs"
                }
              >
                <Button
                  type="primary"
                  icon={isCustomer ? <PlusOutlined /> : <SearchOutlined />}
                  block
                  className="!bg-secondary !border-secondary !hover:!bg-secondary-container !hover:!border-secondary-container !rounded-[0.5rem] !font-semibold !h-11"
                >
                  {isCustomer ? "Post a Job" : "Browse Jobs"}
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
      )}

      {/* 📦 Main Content Area */}
      {!onboardingStatus.needsOnboarding && (
        <Row gutter={[24, 24]}>
          {/* Recent Activity */}
          <Col xs={24} lg={16}>
            <Card
              className="!rounded-[1rem] border-none! !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white"
              styles={{ body: { padding: "24px" } }}
              title={
                <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant">
                  Recent {isCustomer ? "Job Posts" : "Quotes"}
                </Text>
              }
              extra={
                <Link
                  href={
                    isCustomer ? "/dashboard/my-requests" : "/dashboard/jobs"
                  }
                  className="!text-primary !text-sm !font-medium !hover:!text-primary-container"
                >
                  View All <ArrowRightOutlined className="!ml-1 !text-xs" />
                </Link>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={recentItems}
                locale={{
                  emptyText: (
                    <Empty
                      description="No recent activity"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
                renderItem={(item: any) => (
                  <List.Item className="!px-4 !py-4 !rounded-[0.5rem] !hover:!bg-surface-container-low !transition-colors !cursor-pointer !border-0 !border-b !border-outline-variant/30 last:!border-b-0">
                    <List.Item.Meta
                      avatar={
                        <div className="!w-10 !h-10 !rounded-full !bg-primary/10 !flex !items-center !justify-center">
                          {isCustomer ? (
                            <UserOutlined className="!text-primary" />
                          ) : (
                            <FileTextOutlined className="!text-primary" />
                          )}
                        </div>
                      }
                      title={
                        <Text strong className="!text-on-surface !text-base">
                          {isCustomer ? item.title : item.job?.title}
                        </Text>
                      }
                      description={
                        <div className="!flex !items-center !gap-4 !mt-2">
                          <Tag
                            color={
                              (isCustomer ? item.status : item.status) ===
                                "open" ||
                              (isCustomer ? item.status : item.status) ===
                                "pending"
                                ? "processing"
                                : (isCustomer ? item.status : item.status) ===
                                    "accepted"
                                  ? "success"
                                  : "default"
                            }
                            className="!rounded-full !text-xs !font-medium !px-3 !py-0 !border-0"
                          >
                            {(isCustomer ? item.status : item.status)?.replace(
                              "_",
                              " "
                            )}
                          </Tag>
                          <Text className="!text-xs !text-on-surface-variant !flex !items-center !gap-1">
                            <ClockCircleOutlined />
                            {new Date(item.created_at).toLocaleDateString()}
                          </Text>
                          {isCustomer && (
                            <Text className="!text-xs !text-on-surface-variant">
                              {item.quote_count} quote
                              {item.quote_count !== 1 ? "s" : ""}
                            </Text>
                          )}
                          {!isCustomer && item.quoted_price && (
                            <Text className="!text-xs !font-semibold !text-success">
                              ₦{item.quoted_price.toLocaleString()}
                            </Text>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Right Column: Wallet & Profile Status */}
          <Col xs={24} lg={8}>
            {/* Wallet Card */}
            <Card
              className="!rounded-[1rem] border-none! !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !mb-6"
              styles={{ body: { padding: "24px" } }}
            >
              <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-4">
                Wallet Overview
              </Text>
              <div className="!mb-6">
                <Text className="!text-sm !text-on-surface-variant !block !mb-2">
                  Available Balance
                </Text>
                <Title
                  level={3}
                  className="!mb-0 !font-manrope !text-on-surface !font-bold"
                >
                  ₦{stats.walletBalance.toLocaleString()}
                </Title>
              </div>
              <div className="!flex !gap-4">
                <Link href="/dashboard/wallet" className="!flex-1">
                  <Button
                    block
                    className="!border-primary !text-primary !hover:!bg-primary/5 !rounded-[0.5rem] !font-medium"
                  >
                    Manage
                  </Button>
                </Link>
                {isArtisan && (
                  <Link href="/dashboard/withdrawals" className="!flex-1">
                    <Button
                      type="primary"
                      block
                      className="!bg-primary !hover:!bg-primary-container !rounded-[0.5rem] !font-medium"
                    >
                      Withdraw
                    </Button>
                  </Link>
                )}
                {isCustomer && (
                  <Link
                    href="/dashboard/wallet?tab=credits"
                    className="!flex-1"
                  >
                    <Button
                      type="primary"
                      block
                      className="!bg-secondary !border-secondary !hover:!bg-secondary-container !rounded-[0.5rem] !font-medium"
                    >
                      Buy Credits
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Profile Status Card */}
            <Card
              className="!rounded-[1rem] border-none! !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white"
              styles={{ body: { padding: "24px" } }}
            >
              <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-4">
                Profile Status
              </Text>
              <div className="!flex !items-center !gap-4 !mb-6">
                <div className="!w-10 !h-10 !rounded-full !bg-success/10 !flex !items-center !justify-center">
                  <CheckCircleOutlined className="!text-success !text-lg" />
                </div>
                <div>
                  <Text strong className="!text-on-surface !block">
                    Profile Complete
                  </Text>
                  <Text className="!text-xs !text-on-surface-variant">
                    Active as{" "}
                    <span className="!capitalize !font-semibold !text-primary">
                      {onboardingStatus.currentRole}
                    </span>
                  </Text>
                </div>
              </div>
              <Link href="/dashboard/settings">
                <Button
                  block
                  ghost
                  className="!border-outline-variant !text-on-surface-variant !hover:!border-primary !hover:!text-primary !rounded-[0.5rem]"
                >
                  Edit Settings
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
      )}

      {/* 🪟 Onboarding Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
        centered
        closeIcon={<CloseOutlined className="!text-on-surface-variant" />}
        styles={{
          body: { padding: 0 },
          header: { display: "none" },
        }}
      >
        <div className="!rounded-[1rem] !overflow-hidden !bg-white">
          <div className="!p-8">
            <div className="!flex !justify-between !items-start !mb-6 !pb-4 !border-b !border-outline-variant/30">
              <div>
                <Title
                  level={3}
                  className="!mb-2 !font-manrope !text-on-surface"
                >
                  Complete Profile
                </Title>
                <Paragraph className="!mb-0 !text-on-surface-variant !text-sm">
                  This usually takes 2-3 minutes
                </Paragraph>
              </div>
              <Button
                type="text"
                size="small"
                onClick={() => setIsModalOpen(false)}
                className="!text-on-surface-variant !hover:!text-on-surface"
              >
                Skip for now
              </Button>
            </div>

            {isArtisan ? (
              <ArtisanOnboardingForm onComplete={handleOnboardingComplete} />
            ) : isCustomer ? (
              <CustomerOnboardingForm onComplete={handleOnboardingComplete} />
            ) : (
              <div className="!text-center !py-10 !text-on-surface-variant">
                No active role selected. Please contact support.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Content>
  );
}
