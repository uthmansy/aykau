// components/ui/disputes/admin/DisputeResolution.tsx
// components/ui/disputes/admin/DisputeResolution.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Tabs,
  Input,
  Typography,
  Form,
  Select,
  InputNumber,
  Button,
  App,
  Divider,
  Alert,
} from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import DisputeThread from "../DisputeThread";
import EvidenceGallery from "../EvidenceGallery";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Props {
  disputeId: string;
}

export default function DisputeResolution({ disputeId }: Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [dispute, setDispute] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  // 🟢 FIX: Move ALL hooks to the very top, BEFORE any early returns!
  const splitPercentage = Form.useWatch("split_percentage", form) || 0;

  useEffect(() => {
    fetchData();
  }, [disputeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: disputeData, error: dError } = await supabase
        .from("disputes")
        .select(
          `
          *,
          job:job_requests(title, description),
          raiser:raised_by(full_name, email),
          against_user:against(full_name, email)
        `
        )
        .eq("id", disputeId)
        .single();

      if (dError) throw dError;
      setDispute(disputeData);

      if (disputeData?.contract_id) {
        const { data: contractData } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", disputeData.contract_id)
          .single();
        setContract(contractData);
      }
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      message.error("Failed to load dispute details.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (values: any) => {
    setResolving(true);
    try {
      const { error } = await supabase.rpc("resolve_dispute", {
        p_dispute_id: disputeId,
        p_outcome: values.outcome,
        p_split_percentage:
          values.outcome === "split" ? values.split_percentage : null,
        p_resolution_notes: values.resolution_notes,
      });

      if (error) throw error;

      message.success(
        "Dispute resolved successfully! Funds have been distributed."
      );
      router.push("/admin/disputes");
    } catch (error: any) {
      console.error("Resolve error:", error);
      message.error(error.message || "Failed to resolve dispute.");
    } finally {
      setResolving(false);
    }
  };

  // 🟢 NOW it is safe to do early returns, because all hooks have been called
  if (loading || !dispute) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading dispute details...
      </div>
    );
  }

  const isResolved =
    dispute.status === "resolved" || dispute.status === "withdrawn";

  // These are just standard variables, NOT hooks, so they are perfectly fine down here
  const artisanShare = dispute.amount_disputed * (splitPercentage / 100);
  const customerShare = dispute.amount_disputed - artisanShare;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="!rounded-lg"
        />
        <div>
          <Title level={3} className="!mb-1">
            Dispute #{dispute.id.slice(0, 8)}
          </Title>
          <Text type="secondary">
            Raised on {dayjs(dispute.created_at).format("MMM D, YYYY")} •
            Status: {dispute.status.replace("_", " ").toUpperCase()}
          </Text>
        </div>
      </div>

      {isResolved && (
        <Alert
          message={`This dispute was ${dispute.status}.`}
          description={
            dispute.resolution_notes || "No resolution notes provided."
          }
          type={dispute.status === "resolved" ? "success" : "info"}
          showIcon
          icon={<CheckCircleOutlined />}
          className="!rounded-lg"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Context & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Job Context" className="!rounded-xl">
            <div className="space-y-3">
              <div>
                <Text
                  type="secondary"
                  className="text-xs uppercase tracking-wide"
                >
                  Job Title
                </Text>
                <Paragraph className="!mb-0 font-medium">
                  {dispute.job?.title}
                </Paragraph>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text
                    type="secondary"
                    className="text-xs uppercase tracking-wide"
                  >
                    Raiser
                  </Text>
                  <div className="font-medium">{dispute.raiser?.full_name}</div>
                  <Text type="secondary" className="text-xs">
                    {dispute.raiser?.email}
                  </Text>
                </div>
                <div>
                  <Text
                    type="secondary"
                    className="text-xs uppercase tracking-wide"
                  >
                    Against
                  </Text>
                  <div className="font-medium">
                    {dispute.against_user?.full_name}
                  </div>
                  <Text type="secondary" className="text-xs">
                    {dispute.against_user?.email}
                  </Text>
                </div>
              </div>
              <Divider className="!my-3" />
              <div>
                <Text
                  type="secondary"
                  className="text-xs uppercase tracking-wide"
                >
                  Reason
                </Text>
                <Paragraph className="!mb-0">{dispute.description}</Paragraph>
              </div>
            </div>
          </Card>

          <Tabs
            defaultActiveKey="evidence"
            items={[
              {
                key: "evidence",
                label: "Evidence",
                children: <EvidenceGallery disputeId={disputeId} />,
              },
              {
                key: "thread",
                label: "Discussion Thread",
                children: <DisputeThread disputeId={disputeId} />,
              },
            ]}
            className="bg-white p-4 rounded-xl border border-gray-200"
          />
        </div>

        {/* RIGHT COLUMN: Resolution Form */}
        <div className="lg:col-span-1">
          <Card
            title="Admin Resolution"
            className="!rounded-xl !sticky !top-6"
            styles={{ body: { padding: "20px" } }}
          >
            {isResolved ? (
              <div className="text-center py-8">
                <CheckCircleOutlined className="text-4xl text-green-500 mb-3" />
                <Title level={5} className="!mb-2">
                  Dispute Resolved
                </Title>
                <Text type="secondary">
                  Outcome: {dispute.outcome?.replace("_", " ").toUpperCase()}
                </Text>
                {dispute.outcome === "split" && (
                  <Text className="block mt-1 text-xs text-gray-500">
                    Split: {dispute.split_percentage}% to Artisan
                  </Text>
                )}
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleResolve}>
                <div className="bg-gray-50 p-4 rounded-lg mb-5 border border-gray-200">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">
                    Amount in Escrow
                  </Text>
                  <div className="text-2xl font-bold text-gray-900">
                    ₦{Number(dispute.amount_disputed).toLocaleString()}
                  </div>
                </div>

                <Form.Item
                  name="outcome"
                  label="Resolution Outcome"
                  rules={[
                    { required: true, message: "Please select an outcome" },
                  ]}
                >
                  <Select
                    placeholder="Choose how to distribute funds"
                    options={[
                      {
                        value: "full_refund",
                        label: "Full Refund to Customer",
                      },
                      {
                        value: "full_release",
                        label: "Full Release to Artisan",
                      },
                      { value: "split", label: "Split Funds" },
                    ]}
                    onChange={(value) => {
                      if (value !== "split")
                        form.setFieldValue("split_percentage", undefined);
                    }}
                  />
                </Form.Item>

                {form.getFieldValue("outcome") === "split" && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100 space-y-3">
                    <Form.Item
                      name="split_percentage"
                      label="Artisan's Share (%)"
                      rules={[
                        { required: true, message: "Required for split" },
                      ]}
                      className="!mb-2"
                    >
                      <InputNumber<number>
                        min={0}
                        max={100}
                        formatter={(value: number | undefined) => `${value}%`}
                        parser={(value: string | undefined) =>
                          value ? Number(value.replace("%", "")) : 0
                        }
                        className="!w-full"
                      />
                    </Form.Item>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <Text>Artisan receives:</Text>
                        <Text strong>
                          ₦{Number(artisanShare).toLocaleString()}
                        </Text>
                      </div>
                      <div className="flex justify-between">
                        <Text>Customer refund:</Text>
                        <Text strong>
                          ₦{Number(customerShare).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </div>
                )}

                <Form.Item
                  name="resolution_notes"
                  label="Resolution Notes"
                  rules={[
                    { required: true, message: "Please explain your decision" },
                  ]}
                  extra="This will be visible to both parties."
                >
                  <TextArea
                    rows={4}
                    placeholder="Explain the reasoning behind this decision..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={resolving}
                  danger
                  className="!rounded-lg !font-semibold"
                >
                  Confirm & Resolve Dispute
                </Button>
              </Form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
