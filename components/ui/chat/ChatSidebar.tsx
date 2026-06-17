// components/chat/ChatSidebar.tsx
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
  StarFilled,
  SendOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";
import RequestPaymentModal from "./RequestPaymentModal";
import RaiseDisputeModal from "../disputes/RaiseDisputeModal";
import DisputeBanner from "../disputes/DisputeBanner";
import ReviewModal from "../reviews/ReviewModal";
import RequestQuoteButton from "../profile/RequestQuoteButton";

interface Props {
  conversation: any;
  currentUserId: string;
}

export default function ChatSidebar({ conversation, currentUserId }: Props) {
  const router = useRouter();
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

  const [existingReview, setExistingReview] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [conversation?.job_id, conversation?.artisan_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 🟢 SCENARIO 1: General conversation (no job)
      if (!conversation?.job_id) {
        setJob(null);
        setQuote(null);
        setContract(null);
        setPendingRequest(null);
        setDispute(null);
        setExistingReview(null);
        setLoading(false);
        return;
      }

      // 🟢 SCENARIO 2 & 3: Conversation has a job
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

      // 🟢 SCENARIO 2: Job exists but no quote yet
      if (!quoteData) {
        setContract(null);
        setPendingRequest(null);
        setDispute(null);
        setExistingReview(null);
        setLoading(false);
        return;
      }

      // 🟢 SCENARIO 3: Quote exists - check if contract exists
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

          if (contractData.status === "completed") {
            const { data: reviewData } = await supabase.rpc(
              "get_review_for_contract",
              { p_contract_id: contractData.id }
            );
            setExistingReview(reviewData);
          } else {
            setExistingReview(null);
          }
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

      {/* ==========================================
          SCENARIO 1: General Conversation (No Job)
          ========================================== */}
      {!job && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageOutlined className="text-on-surface-variant" />
            <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
              General Inquiry
            </span>
          </div>
          <p className="font-inter text-[14px] text-on-surface-variant leading-relaxed">
            This is a general conversation. You can discuss services, ask
            questions, or request a quote.
          </p>
          {isCustomer && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              {/* <Button
                block
                type="primary"
                icon={<SendOutlined />}
                onClick={() =>
                  message.info("Use the chat to discuss your needs!")
                }
                className="!rounded-lg! !h-auto! !py-2.5! !bg-secondary! hover:!bg-secondary/90! !border-none! font-inter! text-[14px]! font-medium!"
              >
                Discuss in Chat
              </Button> */}
              <RequestQuoteButton
                artisanId={conversation.artisan_id}
                artisanName={"the Artisan"}
                variant="primary"
                size="large"
                className="!rounded-lg! !h-auto! !py-2.5! !bg-secondary! hover:!bg-secondary/90! !border-none! font-inter! text-[14px]! font-medium! shadow-md! shadow-secondary/20! w-full! text-white!"
              />
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          SCENARIO 2: Job Exists, No Quote Yet
          ========================================== */}
      {job && !quote && (
        <>
          {/* Job Details Card */}
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
                  ${job.status === "open" ? "bg-success-emerald/10 text-success-emerald" : "bg-on-surface-variant/10 text-on-surface-variant"}`}
                >
                  {job.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-[12px] text-on-surface-variant">
                  Budget
                </span>
                <span className="font-inter text-[12px] font-medium text-on-surface">
                  {job.budget || "Negotiable"}
                </span>
              </div>
            </div>
          </div>

          {/* Quote Status Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <WalletOutlined className="text-on-surface-variant" />
              <span className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Quote Status
              </span>
            </div>

            {isArtisan ? (
              // 🟢 Artisan View: Send Quote
              <div className="space-y-3">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <p className="font-inter text-[14px] font-semibold text-primary mb-1">
                    Quote Request Received
                  </p>
                  <p className="font-inter text-[12px] text-on-surface-variant">
                    Review the job details and send your quote
                  </p>
                </div>
                <Button
                  block
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() =>
                    router.push(`/dashboard/jobs/send-quote/${job.id}`)
                  }
                  className="!rounded-lg! !h-auto! !py-2.5! !bg-secondary! hover:!bg-secondary/90! !border-none! font-inter! text-[14px]! font-medium! shadow-md! shadow-secondary/20!"
                >
                  Send Quote
                </Button>
              </div>
            ) : (
              // 🟢 Customer View: Waiting for Quote
              <div className="bg-surface-container rounded-xl p-4 text-center">
                <ClockCircleOutlined className="text-3xl text-on-surface-variant mb-2" />
                <p className="font-inter text-[14px] font-medium text-on-surface mb-1">
                  Waiting for Quote
                </p>
                <p className="font-inter text-[12px] text-on-surface-variant">
                  The artisan will review your request and send a quote shortly
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==========================================
          SCENARIO 3: Quote Exists (Original Flow)
          ========================================== */}
      {job && quote && (
        <>
          {/* Job Details Card */}
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

          {/* Quote/Contract Card */}
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
                {quote.status === "accepted" ? "Agreed Price" : "Quoted Price"}
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
                <div className="flex justify-between text-on-surface-variant">
                  <span>Refunded to Customer:</span>
                  <span className="font-medium text-on-surface">
                    ₦{Number(contract.escrow_refunded_amount).toLocaleString()}
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
                        Number(contract.escrow_released_amount) -
                        Number(contract.escrow_refunded_amount)
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="h-px bg-outline-variant/30 my-4" />

            <div className="flex flex-col gap-3">
              {/* Quote not accepted yet */}
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

              {/* Contract active */}
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

              {/* Contract completed */}
              {contract?.status === "completed" && (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <span className="px-3 py-1 rounded-full bg-success-emerald/10 text-success-emerald font-inter text-[12px] font-bold uppercase tracking-wider">
                      Job Completed
                    </span>
                  </div>

                  {isCustomer &&
                    (existingReview ? (
                      <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/30">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <StarFilled
                              key={i}
                              className={`text-sm! ${i < Number(existingReview.rating) ? "!text-secondary" : "!text-outline-variant"}`}
                            />
                          ))}
                        </div>
                        {existingReview.comment && (
                          <p className="text-xs text-on-surface-variant font-inter italic line-clamp-3">
                            "{existingReview.comment}"
                          </p>
                        )}
                        <p className="text-[10px] text-on-surface-variant mt-2 font-inter">
                          You reviewed this job on{" "}
                          {new Date(
                            existingReview.created_at
                          ).toLocaleDateString()}
                          .
                        </p>
                      </div>
                    ) : (
                      <Button
                        block
                        type="primary"
                        icon={<StarFilled />}
                        onClick={() => setIsReviewModalOpen(true)}
                        className="!rounded-lg! !h-auto! !py-2.5! !bg-secondary! hover:!bg-secondary/90! !border-none! font-inter! text-[14px]! font-medium! shadow-md! shadow-secondary/20!"
                      >
                        Leave a Review
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
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
      {contract && (
        <ReviewModal
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          contractId={contract.id}
          onSuccess={() => {
            setIsReviewModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
