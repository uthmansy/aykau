// components/jobs/CreditPurchaseSuccessToast.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { App } from "antd";
import { supabase } from "@/services/supabase/client";

export default function CreditPurchaseSuccessToast() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const creditPurchaseSuccess =
      searchParams.get("credit_purchase") === "success";
    const jobIdToUnlock = searchParams.get("unlock_job");

    if (creditPurchaseSuccess) {
      message.success("Credits purchased successfully!");

      // 🟢 NEW: Auto-unlock job if job ID is present
      if (jobIdToUnlock && !isProcessing) {
        setIsProcessing(true);

        // Small delay to ensure wallet is reconciled
        setTimeout(async () => {
          try {
            const { error } = await supabase.rpc("unlock_job", {
              p_job_id: jobIdToUnlock,
            });

            if (error) {
              console.error("Auto-unlock error:", error);
              message.error(
                "Credits added, but failed to auto-unlock job. Please unlock manually."
              );
            } else {
              message.success("Job unlocked! Redirecting to send quote...");

              // Redirect to send-quote page
              setTimeout(() => {
                router.push(`/dashboard/jobs/send-quote/${jobIdToUnlock}`);
              }, 1000);
            }
          } catch (error) {
            console.error("Auto-unlock error:", error);
            message.error("Credits added, but failed to auto-unlock job.");
          } finally {
            setIsProcessing(false);
          }
        }, 1500); // Wait 1.5s for webhook to process
      }

      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("credit_purchase");
      url.searchParams.delete("unlock_job");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, message, router, isProcessing]);

  return null;
}
