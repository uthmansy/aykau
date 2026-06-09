// components/ui/jobs/CreditPurchaseSuccessToast.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { App } from "antd";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

export default function CreditPurchaseSuccessToast() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);
  const hasHandledRef = useRef(false);

  useEffect(() => {
    // 🟢 Don't run until user is loaded
    if (!userId) {
      return;
    }

    if (hasHandledRef.current) return;

    const intent = searchParams.get("intent");
    const reference = searchParams.get("reference");
    const jobIdToUnlock = searchParams.get("unlock_job");

    // If we have intent and reference, Paystack redirected back
    if ((intent === "credit_purchase" || intent === "add_funds") && reference) {
      hasHandledRef.current = true;
      cleanUrl();

      // Verify payment by checking if transaction exists in database
      verifyPaymentAndProceed(reference, jobIdToUnlock);
    }
  }, [searchParams, message, router, userId]); // 🟢 Added userId to dependencies

  const verifyPaymentAndProceed = async (
    reference: string,
    jobIdToUnlock: string | null
  ) => {
    message.loading({
      content: "Verifying payment...",
      key: "payment-verify",
      duration: 0,
    });

    // Wait a bit for webhook to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Check if transaction exists in database
      const { data: transaction, error } = await supabase
        .from("transactions")
        .select("id, status, amount, type")
        .eq("external_reference_id", reference)
        .eq("user_id", userId)
        .eq("status", "completed")
        .maybeSingle();

      if (error) {
        console.error("Verification error:", error);
        message.error({
          content: "Failed to verify payment. Please check your wallet.",
          key: "payment-verify",
        });
        return;
      }

      if (!transaction) {
        // Transaction not found - webhook might still be processing or payment failed
        message.warning({
          content:
            "Payment verification in progress. Please check your wallet in a moment.",
          key: "payment-verify",
          duration: 5,
        });

        // If there's a job to unlock, redirect to job details anyway
        if (jobIdToUnlock) {
          setTimeout(() => {
            router.push(`/dashboard/jobs/${jobIdToUnlock}`);
          }, 2000);
        } else {
          setTimeout(() => {
            router.push("/dashboard/wallet");
          }, 2000);
        }
        return;
      }

      // Payment verified!
      message.success({
        content: "Payment successful!",
        key: "payment-verify",
      });

      // If there's a job to unlock, do it now
      if (jobIdToUnlock) {
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.rpc("unlock_job", {
              p_job_id: jobIdToUnlock,
            });

            if (error) {
              console.error("Auto-unlock error:", error);
              message.error(
                "Credits added, but failed to auto-unlock. Please unlock manually."
              );
              router.push(`/dashboard/jobs/${jobIdToUnlock}`);
            } else {
              message.success("Job unlocked successfully!");
              router.push(`/dashboard/jobs/send-quote/${jobIdToUnlock}`);
            }
          } catch (error) {
            console.error("Auto-unlock exception:", error);
            router.push(`/dashboard/jobs/${jobIdToUnlock}`);
          }
        }, 1000);
      } else {
        // Just redirect to wallet
        setTimeout(() => {
          router.push("/dashboard/wallet");
        }, 1500);
      }
    } catch (error) {
      console.error("Verification exception:", error);
      message.error({
        content: "Failed to verify payment.",
        key: "payment-verify",
      });
    }
  };

  const cleanUrl = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("intent");
    url.searchParams.delete("status");
    url.searchParams.delete("reference");
    url.searchParams.delete("trxref");
    url.searchParams.delete("unlock_job");
    window.history.replaceState({}, "", url.toString());
  };

  return null;
}
