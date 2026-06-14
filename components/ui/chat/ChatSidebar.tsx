"use client";

import { useEffect, useState } from "react";
import { Button, App, Skeleton } from "antd";
import {
  WalletOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  DollarOutlined,
  FlagOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import RequestPaymentModal from "./RequestPaymentModal";
import RaiseDisputeModal from "../disputes/RaiseDisputeModal";
import DisputeBanner from "../disputes/DisputeBanner";

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
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRaiseDisputeOpen, setIsRaiseDisputeOpen] = useState(false);

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
          const { data: disputeData } = await supabase
            .from("disputes")
            .select("*")
            .eq("contract_id", contractData.id)
            .in("status", ["mediation", "under_review"])
            .maybeSingle();
          setDispute(disputeData);
        }
      } else {
        setContract(null);
        setPendingRequest(null);
        setDispute(null);
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
      if (error.message.includes("insufficient_funds"))
        message.error("Insufficient wallet balance.");
      else if (error.message.includes("insufficient_escrow"))
        message.error("Not enough funds in escrow.");
      else message.error("Failed to update request.");
    }
  };

  const handleMarkComplete = () => {
    if (!contract) return;
    if (dispute)
      return message.warning("Cannot complete job while dispute is active.");
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
          message.success("Job marked complete!");
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
      <div className="p-4 text-center text-on-surface-variant font-inter text-[14px]">
        No job details found.
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-surface-container-low">
      {dispute && (
        <DisputeBanner
          dispute={dispute}
          onWithdraw={() => {
            message.success("Dispute withdrawn!");
            fetchData();
          }}
        />
      )}

      {/* 1. Job Details Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <RiseOutlined className="text-on-surface-variant" />
          <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Job Details
          </span>
        </div>
        <h3 className="font-manrope text-[16px] font-semibold text-primary mb-3 leading-snug">
          {job.title || job.subcategory}
        </h3>
        <div className="space-y-2.5 text-[14px]">
          <div className="flex justify-between items-center">
            <span className="font-inter text-[12px] text-on-surface-variant">
              Status
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider
              ${job.status === "open" ? "bg-success-emerald/10 text-success-emerald" : job.status === "in_progress" ? "bg-primary/10 text-primary" : "bg-on-surface-variant/10 text-on-surface-variant"}`}
            >
              {job.status}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Contract / Quote Card */}
      {quote && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <WalletOutlined className="text-on-surface-variant" />
            <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
              {quote.status === "accepted"
                ? "Active Contract"
                : "Quote Details"}
            </span>
          </div>
          <div className="mb-1">
            <span className="font-inter text-[12px] text-on-surface-variant block">
              Agreed Price
            </span>
            <h4 className="font-manrope text-[24px] font-semibold text-primary mb-0">
              {quote.quoted_price
                ? `₦${Number(quote.quoted_price).toLocaleString()}`
                : "Negotiable"}
            </h4>
          </div>
          {contract && (
            <div className="mt-3 space-y-2 font-inter text-[12px]">
              <div className="flex justify-between text-on-surface-variant">
                <span>Total Funded:</span>
                <span className="font-medium text-on-surface">
                  ₦{Number(contract.escrow_funded_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Released to Artisan:</span>
                <span className="font-medium text-on-surface">
                  ₦{Number(contract.escrow_released_amount).toLocaleString()}
                </span>
              </div>
              {Number(contract.escrow_funded_amount) -
                Number(contract.escrow_released_amount) >
                0 && (
                <div className="flex justify-between text-on-surface bg-surface-container p-2 rounded-lg mt-1 border border-outline-variant/20 font-inter text-[12px]">
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
          <div className="h-px bg-outline-variant/30 my-4" />
          <div className="flex flex-col gap-3">
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
                        className="!rounded-lg! !h-auto! !py-2.5! !bg-secondary! hover:!bg-secondary/90! !border-none! font-inter! text-[14px]! font-medium!"
                      >
                        Accept Quote
                      </Button>
                      <Button
                        block
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleQuoteStatusUpdate("declined")}
                        className="!rounded-lg! !h-auto! !py-2.5! !border-outline-variant! !text-on-surface-variant! hover:!border-error! hover:!text-error! bg-transparent! font-inter! text-[14px]! font-medium!"
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
                    className="!rounded-lg! !h-auto! !py-2.5! !border-outline-variant! !text-on-surface-variant! hover:!border-primary! hover:!text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
                  >
                    Withdraw Quote
                  </Button>
                )}
              </>
            )}
            {quote.status === "accepted" &&
              contract &&
              contract.status !== "completed" && (
                <div className="flex flex-col gap-3">
                  {isCustomer && pendingRequest && (
                    <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4">
                      <p className="font-inter text-[14px] font-semibold text-warning mb-1">
                        Request: ₦
                        {Number(pendingRequest.amount).toLocaleString()}
                      </p>
                      <p className="font-inter text-[12px] text-on-surface-variant mb-3">
                        {pendingRequest.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleRequestAction("approved")}
                          className="!rounded-lg! !bg-secondary! hover:!bg-secondary/90! !border-none! !h-8! font-inter! text-[12px]! font-medium!"
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleRequestAction("rejected")}
                          className="!rounded-lg! !border-outline-variant! !text-on-surface-variant! hover:!border-error! hover:!text-error! bg-transparent! !h-8! font-inter! text-[12px]! font-medium!"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                  {isArtisan && pendingRequest && (
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-2">
                      <ClockCircleOutlined className="text-primary" />
                      <div>
                        <p className="font-inter text-[14px] font-semibold text-primary">
                          Request Pending
                        </p>
                        <p className="font-inter text-[12px] text-on-surface-variant">
                          Waiting for customer approval.
                        </p>
                      </div>
                    </div>
                  )}
                  {isArtisan && !pendingRequest && !dispute && (
                    <Button
                      block
                      type="primary"
                      icon={<DollarOutlined />}
                      onClick={() => setIsRequestModalOpen(true)}
                      className="!rounded-lg! !h-auto! !py-2.5! !bg-secondary! hover:!bg-secondary/90! !border-none! font-inter! text-[14px]! font-medium!"
                    >
                      Request Payment
                    </Button>
                  )}
                  {isCustomer && !dispute && (
                    <Button
                      block
                      icon={<FlagOutlined />}
                      onClick={handleMarkComplete}
                      className="!rounded-lg! !h-auto! !py-2.5! !border-outline-variant! !text-on-surface-variant! hover:!border-primary! hover:!text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
                    >
                      Mark Job as Complete
                    </Button>
                  )}
                  {contract.escrow_funded_amount > 0 && !dispute && (
                    <Button
                      block
                      icon={<WarningOutlined />}
                      onClick={() => setIsRaiseDisputeOpen(true)}
                      className="!rounded-lg! !h-auto! !py-2.5! !bg-error! hover:!bg-error/90! !border-none! !text-on-error! font-inter! text-[14px]! font-medium!"
                    >
                      Raise Dispute
                    </Button>
                  )}
                  {dispute && (
                    <Button
                      block
                      type="primary"
                      icon={<WarningOutlined />}
                      onClick={() =>
                        (window.location.href = `/dashboard/disputes/${dispute.id}`)
                      }
                      className="!rounded-lg! !h-auto! !py-2.5! !bg-warning! hover:!bg-warning/90! !border-none! !text-on-secondary! font-inter! text-[14px]! font-medium!"
                    >
                      View Dispute Details
                    </Button>
                  )}
                </div>
              )}
            {contract?.status === "completed" && (
              <div className="text-center py-2">
                <span className="px-3 py-1 rounded-full bg-success-emerald/10 text-success-emerald font-inter text-[12px] font-bold uppercase tracking-wider">
                  Job Completed
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {contract && (
        <RequestPaymentModal
          open={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          contractId={contract.id}
          maxAmount={Number(contract.total_agreed_amount || 0)}
          onRequestSuccess={fetchData}
        />
      )}
      {contract && (
        <RaiseDisputeModal
          open={isRaiseDisputeOpen}
          onClose={() => setIsRaiseDisputeOpen(false)}
          contractId={contract.id}
          conversationId={conversation.id}
          amountDisputed={
            Number(contract.escrow_funded_amount) -
            Number(contract.escrow_released_amount) -
            Number(contract.escrow_refunded_amount)
          }
          onSuccess={() => {
            setIsRaiseDisputeOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
