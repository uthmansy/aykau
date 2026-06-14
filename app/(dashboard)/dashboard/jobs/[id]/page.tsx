"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton, App, Empty, Button } from "antd";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import JobHeader from "@/components/ui/jobs/JobHeader";
import JobInfoCard from "@/components/ui/jobs/JobInfoCard";
import ContactAccessCard from "@/components/ui/jobs/ContactAccessCard";
import UnlockConsentModal from "@/components/ui/jobs/JobDetailDrawer/UnlockConsentModal";
import useJobCreditCost from "@/hooks/useJobCreditCost";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => state.user?.role);

  const [job, setJob] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loadingUnlock, setLoadingUnlock] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const isCustomer = job && userId && job.customer_id === userId;
  const isArtisanViewer = userRole === "artisan" && !isCustomer;
  const creditCost = useJobCreditCost(job);

  useEffect(() => {
    if (params.id && userId) fetchJobDetails();
  }, [params.id, userId]);

  useEffect(() => {
    if (job?.id && userId && isArtisanViewer) checkUnlockStatus();
    else if (isCustomer) setIsUnlocked(true);
  }, [job?.id, userId, isArtisanViewer, isCustomer]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const { data: jobData, error } = await supabase
        .from("job_requests")
        .select(
          `*, customer:profiles!customer_id(id, full_name, username, avatar_url, phone, email)`
        )
        .eq("id", params.id)
        .single();
      if (error) throw error;
      setJob(jobData);
      setCustomer(jobData?.customer);
    } catch (error: any) {
      message.error("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const checkUnlockStatus = async () => {
    if (!job?.id || !userId) return;
    try {
      const { data: unlockData } = await supabase
        .from("unlocked_jobs")
        .select("id")
        .eq("job_id", job.id)
        .eq("artisan_id", userId)
        .eq("is_refunded", false)
        .maybeSingle();
      setIsUnlocked(!!unlockData);

      const { data: walletData } = await supabase
        .from("wallets")
        .select("credit_balance")
        .eq("user_id", userId)
        .single();
      setCreditBalance(Number(walletData?.credit_balance || 0));
    } catch (error) {}
  };

  const handleUnlockClick = () => {
    if (creditBalance >= creditCost) setShowConsentModal(true);
    else
      message.warning(
        `You need ${creditCost} credits. Your balance is ${creditBalance}.`
      );
  };

  const confirmUnlock = async () => {
    setLoadingUnlock(true);
    try {
      const { data, error } = await supabase.rpc("unlock_job", {
        p_job_id: job.id,
      });
      if (error) throw error;
      if (data?.success) {
        message.success("Job unlocked successfully!");
        setIsUnlocked(true);
        setCreditBalance((prev) => prev - creditCost);
        setShowConsentModal(false);
      }
    } catch (error: any) {
      message.error("Failed to unlock job.");
    } finally {
      setLoadingUnlock(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-8">
        <Skeleton.Input active className="w-32 h-8 mb-4 rounded-lg!" />
        <Skeleton active paragraph={{ rows: 8 }} className="rounded-2xl!" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-10 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Empty
          description="Job Not Found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button
          type="primary"
          onClick={() => router.back()}
          className="mt-4 rounded-lg! bg-secondary! border-none!"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-8">
      <JobHeader
        job={job}
        onBack={() => router.back()}
        creditBalance={creditBalance}
        showBalance={isArtisanViewer && !isUnlocked}
      />
      <JobInfoCard job={job} />

      {isArtisanViewer && (
        <ContactAccessCard
          isUnlocked={isUnlocked}
          customer={customer}
          creditBalance={creditBalance}
          onUnlock={handleUnlockClick}
          onSendQuote={() =>
            router.push(`/dashboard/jobs/send-quote/${job.id}`)
          }
          loading={loadingUnlock}
          creditCost={creditCost}
        />
      )}

      {isCustomer && (
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20">
          <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-primary mb-3">
            Your Contact Info
          </h4>
          <p className="font-inter text-[16px] text-on-surface">
            {customer?.phone} • {customer?.email}
          </p>
          <p className="font-inter text-[14px] text-on-surface-variant mt-2">
            Artisans must spend credits to unlock this job and view your contact
            details.
          </p>
        </div>
      )}

      {showConsentModal && (
        <UnlockConsentModal
          open={showConsentModal}
          onClose={() => setShowConsentModal(false)}
          onConfirm={confirmUnlock}
          job={job}
          creditBalance={creditBalance}
          loading={loadingUnlock}
        />
      )}
    </div>
  );
}
