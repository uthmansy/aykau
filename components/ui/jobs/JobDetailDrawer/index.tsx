// components/jobs/JobDetailDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { Drawer, App } from "antd";
import { JobListing } from "@/lib/jobs/types";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import useJobCreditCost from "@/hooks/useJobCreditCost"; // 🟢 Import hook

import DrawerHeader from "./DrawerHeader";
import JobContentSection from "./JobContentSection";
import ClientSection from "./ClientSection";
import ActivitySection from "./ActivitySection";
import DrawerFooter from "./DrawerFooter";
import UnlockConsentModal from "./UnlockConsentModal";
import BuyCreditsModal from "../../wallet/BuyCreditsModal";

interface Props {
  job: JobListing | null;
  open: boolean;
  onClose: () => void;
  onQuoteClick?: (jobId: string) => void;
}

export default function JobDetailDrawer({
  job,
  open,
  onClose,
  onQuoteClick,
}: Props) {
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => state.user?.role);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loadingUnlock, setLoadingUnlock] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  const isCustomer = job && userId && job.customer_id === userId;
  const isArtisanViewer = userRole === "artisan" && !isCustomer;

  const router = useRouter();
  const creditCost = useJobCreditCost(job); // 🟢 Use hook

  useEffect(() => {
    if (open && job?.id && userId && isArtisanViewer) {
      checkUnlockStatus();
    } else if (isCustomer) {
      setIsUnlocked(true);
    }
  }, [open, job?.id, userId, isArtisanViewer, isCustomer]);

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
      setShowBuyCreditsModal(true);
    }
  };

  const confirmUnlock = async () => {
    if (!job?.id) return;

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

        setTimeout(() => {
          onClose();
          router.push(`/dashboard/jobs/send-quote/${job.id}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Unlock error:", error);

      if (error.message?.includes("insufficient_credits")) {
        message.error("Insufficient credits. Please buy more credits.");
      } else if (error.message?.includes("job_not_available")) {
        message.error("This job is no longer available for quotes.");
        onClose();
        window.location.reload();
      } else {
        message.error("Failed to unlock job. Please try again.");
      }
    } finally {
      setLoadingUnlock(false);
    }
  };

  if (!job) return null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        width={480}
        closable={false}
        maskClosable={true}
        className="job-detail-drawer"
        styles={{
          body: { padding: 0, background: "#fafafa" },
          mask: { background: "rgba(0,0,0,0.4)" },
        }}
      >
        <div className="h-full flex flex-col bg-white">
          <DrawerHeader
            job={job}
            onClose={onClose}
            creditBalance={creditBalance}
            showBalance={isArtisanViewer && !isUnlocked}
          />

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <JobContentSection job={job} />
            <ClientSection
              job={job}
              isUnlocked={isUnlocked}
              isArtisanViewer={isArtisanViewer}
              creditBalance={creditBalance}
              onUnlock={handleUnlockClick}
              loadingUnlock={loadingUnlock}
            />
            <ActivitySection job={job} />
          </div>

          <DrawerFooter
            job={job}
            isUnlocked={isUnlocked}
            isArtisanViewer={isArtisanViewer}
            onUnlock={handleUnlockClick}
            loadingUnlock={loadingUnlock}
          />
        </div>
      </Drawer>

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
      {showBuyCreditsModal && (
        <BuyCreditsModal
          open={showBuyCreditsModal}
          onClose={() => setShowBuyCreditsModal(false)}
          onSuccess={() => {
            checkUnlockStatus();
          }}
          jobId={job?.id}
        />
      )}
    </>
  );
}
