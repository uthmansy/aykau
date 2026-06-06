// components/ui/chat/ChatSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Divider,
  App,
  Skeleton,
  Alert,
  Modal,
} from "antd";
import {
  WalletOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  DollarOutlined,
  SendOutlined,
  FlagOutlined,
  RiseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import RequestPaymentModal from "./RequestPaymentModal";

const { Title, Text } = Typography;

interface Props {
  conversation: any;
  currentUserId: string;
}

export default function ChatSidebar({ conversation, currentUserId }: Props) {
  const { message, modal } = App.useApp();
  const [job, setJob] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const isCustomer = conversation.customer_id === currentUserId;
  const isArtisan = conversation.artisan_id === currentUserId;

  useEffect(() => {
    if (!conversation?.job_id) return;
    fetchData();
  }, [conversation?.job_id, conversation?.artisan_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: jobData } = await supabase
        .from("job_requests")
        .select("*")
        .eq("id", conversation.job_id)
        .single();
      setJob(jobData);

      const { data: quoteData } = await supabase
        .from("job_quotes")
        .select("*")
        .eq("job_id", conversation.job_id)
        .eq("artisan_id", conversation.artisan_id)
        .maybeSingle();
      setQuote(quoteData);

      if (quoteData?.status === "accepted") {
        const { data: contractData } = await supabase
          .from("contracts")
          .select("*")
          .eq("job_id", conversation.job_id)
          .eq("artisan_id", conversation.artisan_id)
          .single();
        setContract(contractData);

        if (contractData) {
          const { data: requestData } = await supabase
            .from("payment_requests")
            .select("*")
            .eq("contract_id", contractData.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .maybeSingle();
          setPendingRequest(requestData);
        }
      } else {
        setContract(null);
        setPendingRequest(null);
      }
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteStatusUpdate = async (
    newStatus: "accepted" | "declined" | "withdrawn"
  ) => {
    if (!quote) return;
    let error: any = null;

    if (newStatus === "accepted") {
      const { error: rpcError } = await supabase.rpc(
        "accept_quote_and_create_contract",
        { p_quote_id: quote.id }
      );
      error = rpcError;
    } else {
      const { error: updateError } = await supabase
        .from("job_quotes")
        .update({ status: newStatus })
        .eq("id", quote.id);
      error = updateError;
    }

    if (error) {
      if (error.message.includes("job_already_filled"))
        message.warning("This job is already assigned.");
      else message.error(`Failed to ${newStatus} quote.`);
    } else {
      message.success(`Quote ${newStatus} successfully!`);
      fetchData();
    }
  };

  // 🟢 UPDATED: Handles Approving/Rejecting Requests (Triggers Money Movement)
  const handleRequestAction = async (action: "approved" | "rejected") => {
    if (!pendingRequest) return;
    try {
      const { error } = await supabase.rpc("update_payment_request_status", {
        p_request_id: pendingRequest.id,
        p_new_status: action,
      });

      if (error) throw error;

      message.success(`Request ${action} successfully!`);
      fetchData();
    } catch (error: any) {
      console.error("Request action error:", error);
      // Handle specific financial errors
      if (error.message.includes("insufficient_funds")) {
        message.error(
          "Insufficient wallet balance. Please add funds to your wallet first."
        );
      } else if (error.message.includes("insufficient_escrow")) {
        message.error("Not enough funds currently held in escrow.");
      } else {
        message.error("Failed to update request.");
      }
    }
  };

  // 🟢 NEW: Handles Marking Job Complete (Releases Remaining Funds)
  const handleMarkComplete = () => {
    if (!contract) return;

    modal.confirm({
      title: "Mark Job as Complete?",
      content:
        "This will release any remaining escrow funds to the artisan and close the contract.",
      okText: "Yes, Complete & Release",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const { error } = await supabase.rpc("mark_job_completed", {
            p_contract_id: contract.id,
          });
          if (error) throw error;
          message.success("Job marked complete and funds released!");
          fetchData();
        } catch (error: any) {
          message.error("Failed to complete job.");
        }
      },
    });
  };

  if (loading)
    return (
      <div className="p-4 space-y-4">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  if (!job)
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No job details found.
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-gray-50/30">
      {/* 1. Job Details Card */}
      <Card
        className="!rounded-xl !shadow-sm !border-gray-200 !bg-white"
        styles={{ body: { padding: "16px" } }}
      >
        <div className="flex items-center gap-2 mb-3">
          <RiseOutlined className="text-gray-500" />
          <Text
            strong
            className="text-xs text-gray-500 uppercase tracking-wide"
          >
            Job Details
          </Text>
        </div>
        <Title level={5} className="!mb-3 !text-gray-900 !leading-snug">
          {job.title || job.subcategory}
        </Title>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <Text type="secondary" className="!text-xs">
              Status
            </Text>
            <Tag
              color={
                job.status === "open"
                  ? "success"
                  : job.status === "in_progress"
                  ? "processing"
                  : "default"
              }
              className="!rounded-full !text-[10px] !uppercase !m-0"
            >
              {job.status}
            </Tag>
          </div>
        </div>
      </Card>

      {/* 2. Contract / Quote Card */}
      {quote && (
        <Card
          className="!rounded-xl !shadow-sm !border-gray-200 !bg-white"
          styles={{ body: { padding: "16px" } }}
        >
          <div className="flex items-center gap-2 mb-3">
            <WalletOutlined className="text-gray-500" />
            <Text
              strong
              className="text-xs text-gray-500 uppercase tracking-wide"
            >
              {quote.status === "accepted"
                ? "Active Contract"
                : "Quote Details"}
            </Text>
          </div>

          <div className="mb-1">
            <Text type="secondary" className="!text-xs">
              Agreed Price
            </Text>
            <Title level={4} className="!mb-0 !text-gray-900 !font-bold">
              {quote.quoted_price
                ? `₦${Number(quote.quoted_price).toLocaleString()}`
                : "Negotiable"}
            </Title>
          </div>

          {/* Escrow Stats (Only show if contract exists) */}
          {contract && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Total Funded:</span>
                <span className="font-medium text-gray-900">
                  ₦{Number(contract.escrow_funded_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Released to Artisan:</span>
                <span className="font-medium text-gray-900">
                  ₦{Number(contract.escrow_released_amount).toLocaleString()}
                </span>
              </div>

              {/* 🟢 NEW: Explicitly show the remaining balance */}
              {Number(contract.escrow_funded_amount) -
                Number(contract.escrow_released_amount) >
                0 && (
                <div className="flex justify-between text-gray-900 bg-gray-100 p-2 rounded-md mt-1 border border-gray-200">
                  <span className="font-semibold">Remaining in Escrow:</span>
                  <span className="font-bold">
                    ₦
                    {(
                      Number(contract.escrow_funded_amount) -
                      Number(contract.escrow_released_amount)
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <Divider className="!my-3 !border-gray-100" />

          <div className="space-y-3">
            {/* PRE-ACCEPTANCE ACTIONS */}
            {quote.status !== "accepted" && (
              <>
                {isCustomer &&
                  (quote.status === "pending" ||
                    quote.status === "responded") && (
                    <>
                      <Button
                        block
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleQuoteStatusUpdate("accepted")}
                        className="!rounded-lg !bg-gray-900 hover:!bg-gray-800 !border-0 !h-9 !text-sm"
                      >
                        Accept Quote
                      </Button>
                      <Button
                        block
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleQuoteStatusUpdate("declined")}
                        className="!rounded-lg !h-9 !text-sm"
                      >
                        Decline Quote
                      </Button>
                    </>
                  )}
                {isArtisan && quote.status === "pending" && (
                  <Button
                    block
                    icon={<UndoOutlined />}
                    onClick={() => handleQuoteStatusUpdate("withdrawn")}
                    className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-gray-500 !h-9 !text-sm"
                  >
                    Withdraw Quote
                  </Button>
                )}
              </>
            )}

            {/* POST-ACCEPTANCE ACTIONS */}
            {quote.status === "accepted" &&
              contract &&
              contract.status !== "completed" && (
                <div className="space-y-3">
                  {/* Request Banner */}
                  {isCustomer && pendingRequest && (
                    <Alert
                      message={`Request: ₦${Number(
                        pendingRequest.amount
                      ).toLocaleString()}`}
                      description={pendingRequest.description}
                      type="warning"
                      showIcon
                      icon={<ClockCircleOutlined />}
                      className="!rounded-lg !border-yellow-200 !bg-yellow-50"
                      action={
                        <div className="flex flex-col gap-2 mt-2">
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleRequestAction("approved")}
                            className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-8 !text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            danger
                            onClick={() => handleRequestAction("rejected")}
                            className="!h-8 !text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      }
                    />
                  )}

                  {isArtisan && pendingRequest && (
                    <Alert
                      message="Request Pending"
                      description="Waiting for customer approval."
                      type="info"
                      showIcon
                      icon={<ClockCircleOutlined />}
                      className="!rounded-lg !border-gray-200 !bg-gray-50 !text-gray-600"
                    />
                  )}

                  {isArtisan && !pendingRequest && (
                    <Button
                      block
                      type="primary"
                      icon={<DollarOutlined />}
                      onClick={() => setIsRequestModalOpen(true)}
                      className="!rounded-lg !bg-gray-900 hover:!bg-gray-800 !border-0 !h-9 !text-sm"
                    >
                      Request Payment
                    </Button>
                  )}

                  {/* Mark Complete Button */}
                  {isCustomer && (
                    <Button
                      block
                      icon={<FlagOutlined />}
                      onClick={handleMarkComplete}
                      className="!rounded-lg !border-gray-300 !text-gray-700 hover:!border-gray-500 !h-9 !text-sm"
                    >
                      Mark Job as Complete
                    </Button>
                  )}
                </div>
              )}

            {/* Completed State */}
            {contract?.status === "completed" && (
              <div className="text-center py-2">
                <Tag
                  color="success"
                  className="!rounded-full !px-3 !py-1 !text-xs"
                >
                  Job Completed
                </Tag>
              </div>
            )}
          </div>
        </Card>
      )}

      {contract && (
        <RequestPaymentModal
          open={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          contractId={contract.id}
          artisanId={conversation.artisan_id}
          customerId={conversation.customer_id}
          maxAmount={Number(contract.total_agreed_amount || 0)}
          onRequestSuccess={fetchData}
        />
      )}
    </div>
  );
}
