"use client";

import { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  MessageOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import JobPostingForm from "@/components/ui/JobPostingForm";
import Link from "next/link";

const { Content } = Layout;
const { Title, Text } = Typography;

type JobRequest = {
  id: string;
  title: string;
  subcategory: string;
  status: string;
  quote_count: number;
  created_at: string;
};

type Stats = {
  total: number;
  active: number;
  quotes: number;
};

export default function MyRequests() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, quotes: 0 });
  const [loading, setLoading] = useState(true);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("job_requests")
        .select("id, title, subcategory, status, quote_count, created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const jobs = data || [];
      setRequests(jobs);

      // Calculate live stats
      const total = jobs.length;
      const active = jobs.filter((j) =>
        ["open", "quoting"].includes(j.status)
      ).length;
      const quotes = jobs.reduce((sum, j) => sum + (j.quote_count || 0), 0);

      setStats({ total, active, quotes });
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Map statuses to exact Design System functional colors
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "open":
      case "quoting":
        return { color: "#15196c", background: "#e0e0ff" }; // Primary Fixed
      case "closed":
      case "completed":
        return { color: "#10B981", background: "#ecfdf5" }; // Success Emerald
      case "cancelled":
        return { color: "#ba1a1a", background: "#ffdad6" }; // Error
      default:
        return { color: "#464651", background: "#f0ecf4" }; // Surface Container
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Content className="!flex !items-center !justify-center !min-h-[60vh]">
        <Spin size="large" />
      </Content>
    );
  }

  return (
    <Content className="!p-6 !max-w-[1440px] !mx-auto">
      {/* 📌 Page Header */}
      <div className="!flex !justify-between !items-center !mb-8 !flex-wrap !gap-4">
        <div>
          <Title
            level={2}
            className="!font-manrope !text-on-surface !mb-2 !font-semibold !text-[32px] !leading-[40px] !m-0"
          >
            My Requests
          </Title>
          <Text className="!text-on-surface-variant !text-base">
            Manage your job postings and track incoming quotes.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          className="!bg-secondary !border-secondary !hover:!bg-secondary-container !hover:!border-secondary-container !rounded-[0.5rem] !h-11 !px-6 !font-semibold !shadow-none"
        >
          Post a Job
        </Button>
      </div>

      {/* 📊 Stats Row (Level 1 Cards - No Borders) */}
      <Row gutter={[24, 24]} className="!mb-8">
        <Col xs={24} sm={8}>
          <Card
            className="!rounded-[1rem] !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !border-0"
            styles={{ body: { padding: "24px" } }}
          >
            <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-2">
              Total Requests
            </Text>
            <Title
              level={3}
              className="!mb-0 !font-manrope !text-on-surface !font-bold"
            >
              {stats.total}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="!rounded-[1rem] !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !border-0"
            styles={{ body: { padding: "24px" } }}
          >
            <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-2">
              Active Requests
            </Text>
            <Title
              level={3}
              className="!mb-0 !font-manrope !text-on-surface !font-bold"
            >
              {stats.active}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="!rounded-[1rem] !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !border-0"
            styles={{ body: { padding: "24px" } }}
          >
            <Text className="!text-[12px] !font-semibold !uppercase !tracking-[0.05em] !text-on-surface-variant !block !mb-2">
              Quotes Received
            </Text>
            <Title
              level={3}
              className="!mb-0 !font-manrope !text-on-surface !font-bold"
            >
              {stats.quotes}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* 📋 Requests List (Vertical Layout) */}
      {requests.length > 0 ? (
        <div className="!flex !flex-col !gap-6">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="!rounded-[1rem] !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !border-0 !transition-all !hover:!shadow-[0_10px_32px_rgba(0,0,0,0.12)]"
              styles={{ body: { padding: "24px" } }}
            >
              <div className="!flex !flex-col !lg:flex-row !lg:items-center !justify-between !gap-6">
                {/* Left Side: Info */}
                <div className="!flex-1 !min-w-0">
                  <div className="!flex !items-center !gap-3 !mb-3">
                    <Tag
                      style={getStatusStyle(req.status)}
                      className="!rounded-full !text-xs !font-medium !px-3 !py-0.5 !m-0 !border-0"
                    >
                      {req.status.replace("_", " ")}
                    </Tag>
                    <Text className="!text-xs !text-on-surface-variant !flex !items-center !gap-1.5">
                      <CalendarOutlined />
                      {formatDate(req.created_at)}
                    </Text>
                  </div>

                  <Title
                    level={4}
                    className="!font-manrope !text-on-surface !mb-1 !text-[20px] !leading-[28px] !m-0 !truncate"
                  >
                    {req.title}
                  </Title>
                  <Text className="!text-sm !text-on-surface-variant !capitalize !block !truncate">
                    {req.subcategory.replace("_", " ")}
                  </Text>
                </div>

                {/* Right Side: Stats & Action */}
                <div className="!flex !flex-col !sm:flex-row !items-start !sm:items-center !gap-4 !sm:gap-8 !lg:border-l !lg:border-outline-variant/20 !lg:pl-8 !w-full !lg:w-auto">
                  <div className="!text-center !sm:text-left">
                    <Text className="!text-xs !text-on-surface-variant !block !mb-1">
                      Quotes
                    </Text>
                    <div className="!flex !items-center !gap-2">
                      <MessageOutlined className="!text-primary" />
                      <Text strong className="!text-on-surface !text-lg">
                        {req.quote_count}
                      </Text>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/jobs/manage/${req.id}`}
                    className="!w-full !sm:w-auto"
                  >
                    <Button
                      block
                      className="!border-primary !text-primary !hover:!bg-primary/5 !rounded-[0.5rem] !h-10 !px-6 !font-semibold"
                    >
                      Manage <ArrowRightOutlined className="!ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // 📭 Empty State
        <Card
          className="!rounded-[1rem] !shadow-[0_4px_20px_rgba(0,0,0,0.04)] !bg-white !border-0 !text-center !py-16"
          styles={{ body: { padding: "24px" } }}
        >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
            <Text className="!text-on-surface-variant !block !mb-6 !text-base">
              You haven't posted any job requests yet.
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
              className="!bg-secondary !border-secondary !hover:!bg-secondary-container !rounded-[0.5rem] !h-11 !px-8 !font-semibold !shadow-none"
            >
              Post Your First Job
            </Button>
          </Empty>
        </Card>
      )}

      {/* 🪟 Glassmorphic Modal for Job Posting (Level 2 Overlay) */}
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={900}
        centered
        closeIcon={<CloseOutlined className="!text-on-surface-variant" />}
        styles={{
          content: {
            padding: 0,
            background: "rgba(255, 255, 255, 0.7)", // Semi-transparent white fill
            backdropFilter: "blur(12px)", // 12px background blur
            border: "1px solid rgba(255, 255, 255, 0.2)", // 1px white border (20% opacity)
            borderRadius: "1rem",
            overflow: "hidden",
          },
          body: {
            padding: "24px 32px",
            maxHeight: "85vh",
            overflowY: "auto",
          },
          header: {
            padding: "24px 32px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            marginBottom: 0,
          },
        }}
        title={
          <div className="!flex !items-center !gap-3">
            <div className="!w-8 !h-8 !rounded-[0.5rem] !bg-secondary/10 !flex !items-center !justify-center !text-secondary">
              <PlusOutlined />
            </div>
            <span className="!font-manrope !font-semibold !text-lg !text-on-surface">
              Post a New Request
            </span>
          </div>
        }
      >
        {/* TS Error Fixed: Removed onComplete prop */}
        <JobPostingForm />
      </Modal>
    </Content>
  );
}
