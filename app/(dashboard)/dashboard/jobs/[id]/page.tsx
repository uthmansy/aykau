// app/(dashboard)/dashboard/jobs/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Skeleton, App } from "antd";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import JobHeader from "@/components/ui/jobs/JobHeader";
import JobInfoCard from "@/components/ui/jobs/JobInfoCard";
import ContactAccessCard from "@/components/ui/jobs/ContactAccessCard";
import UnlockConsentModal from "@/components/ui/jobs/JobDetailDrawer/UnlockConsentModal";
import useJobCreditCost from "@/hooks/useJobCreditCost"; // 🟢 Import hook

const { Title, Text } = Typography;

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

  const creditCost = useJobCreditCost(job); // 🟢 Use hook

  useEffect(() => {
    if (params.id && userId) {
      fetchJobDetails();
    }
  }, [params.id, userId]);

  useEffect(() => {
    if (job?.id && userId && isArtisanViewer) {
      checkUnlockStatus();
    } else if (isCustomer) {
      setIsUnlocked(true);
    }
  }, [job?.id, userId, isArtisanViewer, isCustomer]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const { data: jobData, error } = await supabase
        .from("job_requests")
        .select(
          `*, customer:profiles!customer_id(id, full_name, username, avatar_url, phone)`
        )
        .eq("id", params.id)
        .single();

      if (error) throw error;

      setJob(jobData);
      setCustomer(jobData?.customer);
    } catch (error: any) {
      console.error("Error fetching job:", error);
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
    } catch (error) {
      console.error("Error checking unlock status:", error);
    }
  };

  const handleUnlockClick = () => {
    if (creditBalance >= creditCost) {
      setShowConsentModal(true);
    } else {
      message.warning(
        `You need ${creditCost} credits to unlock this job. Your balance is ${creditBalance}.`
      );
    }
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
      console.error("Unlock error:", error);
      if (error.message?.includes("insufficient_credits")) {
        message.error("Insufficient credits. Please buy more credits.");
      } else {
        message.error("Failed to unlock job. Please try again.");
      }
    } finally {
      setLoadingUnlock(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton.Input active className="w-32 h-8 mb-4" />
        <Skeleton active paragraph={{ rows: 8 }} />
        <Skeleton.Button active className="!w-full !h-48 !rounded-2xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <Title level={3} className="!text-gray-900">
          Job Not Found
        </Title>
        <Text className="!text-gray-500 block mb-4">
          This job may have been removed or is no longer available.
        </Text>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Text className="!text-gray-600 !text-sm">
            <strong>Your Contact Info:</strong> {customer?.phone} •{" "}
            {customer?.email}
          </Text>
          <Text className="!text-gray-400 !text-xs block mt-1">
            Artisans must spend credits to unlock this job and view your contact
            details.
          </Text>
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
