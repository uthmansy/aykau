// app/(dashboard)/dashboard/payment/processing/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Typography, Spin, Button, Result } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  WalletOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

const { Title, Text } = Typography;

type VerificationState = "loading" | "success" | "failed" | "not_found";

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);

  const [state, setState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [jobIdToUnlock, setJobIdToUnlock] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const hasVerifiedRef = useRef(false);

  // Extract params on mount
  useEffect(() => {
    const reference = searchParams.get("reference");
    const unlockJob = searchParams.get("unlock_job");
    const paymentIntent = searchParams.get("intent");

    setJobIdToUnlock(unlockJob);
    setIntent(paymentIntent);

    // If no reference, something is wrong
    if (!reference) {
      setState("failed");
      setErrorMessage("Invalid payment reference. Please contact support.");
      return;
    }

    // Wait for user to load, then verify
    if (userId && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      verifyPayment(reference, unlockJob, paymentIntent);
    }
  }, [userId, searchParams]);

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (state !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          performRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  const verifyPayment = async (
    reference: string,
    unlockJob: string | null,
    paymentIntent: string | null
  ) => {
    setState("loading");

    // Wait for webhook to process
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      // Poll a few times in case webhook is slow
      let transaction = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!transaction && attempts < maxAttempts) {
        const { data } = await supabase
          .from("transactions")
          .select("id, status, amount, type")
          .eq("external_reference_id", reference)
          .eq("user_id", userId)
          .eq("status", "completed")
          .maybeSingle();

        transaction = data;

        if (!transaction && attempts < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        attempts++;
      }

      if (!transaction) {
        // Payment not found after multiple attempts
        setState("not_found");
        return;
      }

      // Payment verified! Now unlock job if needed
      if (unlockJob) {
        try {
          const { error: unlockError } = await supabase.rpc("unlock_job", {
            p_job_id: unlockJob,
          });

          if (unlockError) {
            console.error("Auto-unlock error:", unlockError);
            // Still show success but with a note
            setState("success");
          } else {
            setState("success");
          }
        } catch (error) {
          console.error("Auto-unlock exception:", error);
          setState("success");
        }
      } else {
        setState("success");
      }
    } catch (error) {
      console.error("Verification exception:", error);
      setState("failed");
      setErrorMessage("An error occurred while verifying your payment.");
    }
  };

  const performRedirect = () => {
    if (jobIdToUnlock && intent === "credit_purchase") {
      router.push(`/dashboard/jobs/send-quote/${jobIdToUnlock}`);
    } else if (intent === "add_funds") {
      router.push("/dashboard/wallet");
    } else {
      router.push("/dashboard/jobs");
    }
  };

  const retryVerification = () => {
    const reference = searchParams.get("reference");
    if (reference && userId) {
      hasVerifiedRef.current = false;
      setState("loading");
      verifyPayment(reference, jobIdToUnlock, intent);
    }
  };

  // ───────── LOADING STATE ─────────
  if (state === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-4 border-blue-100">
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 40, color: "#3b82f6" }}
                    spin
                  />
                }
              />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-blue-200 border-t-transparent animate-spin opacity-30" />
          </div>
          <Title level={3} className="!text-gray-900 !mb-2">
            Verifying Your Payment
          </Title>
          <Text className="!text-gray-500 !text-base block mb-4">
            Please wait while we confirm your transaction with Paystack...
          </Text>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
          <Text className="!text-gray-400 !text-xs block mt-6">
            Do not close or refresh this page
          </Text>
        </div>
      </div>
    );
  }

  // ───────── SUCCESS STATE ─────────
  if (state === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-4 border-green-100">
              <CheckCircleFilled
                style={{ fontSize: 56, color: "#10b981" }}
                className="animate-in zoom-in duration-300"
              />
            </div>
          </div>
          <Title level={3} className="!text-gray-900 !mb-2">
            Payment Successful!
          </Title>
          <Text className="!text-gray-500 !text-base block mb-6">
            {jobIdToUnlock && intent === "credit_purchase"
              ? "Your credits have been added and the job has been unlocked."
              : "Your payment has been processed successfully."}
          </Text>

          {jobIdToUnlock && intent === "credit_purchase" ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <Text className="!text-green-800 !text-sm block">
                <strong>Redirecting to send quote</strong> in {countdown} second
                {countdown !== 1 ? "s" : ""}...
              </Text>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <Text className="!text-green-800 !text-sm block">
                <strong>Redirecting</strong> in {countdown} second
                {countdown !== 1 ? "s" : ""}...
              </Text>
            </div>
          )}

          <Button
            type="primary"
            size="large"
            onClick={performRedirect}
            icon={<ArrowRightOutlined />}
            className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-11 !rounded-lg !font-medium !px-6"
          >
            Continue Now
          </Button>
        </div>
      </div>
    );
  }

  // ───────── NOT FOUND STATE ─────────
  if (state === "not_found") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center border-4 border-amber-100">
              <WalletOutlined style={{ fontSize: 48, color: "#f59e0b" }} />
            </div>
          </div>
          <Title level={3} className="!text-gray-900 !mb-2">
            Payment Still Processing
          </Title>
          <Text className="!text-gray-500 !text-base block mb-6">
            We couldn't find your transaction yet. This sometimes happens when
            the payment processor is slow to notify us. Your funds are likely on
            their way.
          </Text>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <Text className="!text-amber-900 !text-sm block mb-2">
              <strong>What to do:</strong>
            </Text>
            <ul className="!text-amber-800 !text-sm space-y-1.5">
              <li>• Wait a minute and try verifying again</li>
              <li>• Check your wallet page for the transaction</li>
              <li>• Check your email for a Paystack receipt</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              size="large"
              onClick={() => router.push("/dashboard/wallet")}
              className="!h-11 !rounded-lg !flex-1"
            >
              Check Wallet
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={retryVerification}
              className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-11 !rounded-lg !flex-1"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ───────── FAILED STATE ─────────
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center border-4 border-red-100">
            <CloseCircleFilled style={{ fontSize: 56, color: "#ef4444" }} />
          </div>
        </div>
        <Title level={3} className="!text-gray-900 !mb-2">
          Verification Failed
        </Title>
        <Text className="!text-gray-500 !text-base block mb-6">
          {errorMessage ||
            "We couldn't verify your payment. Please try again or contact support."}
        </Text>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
          <Text className="!text-red-900 !text-sm block mb-2">
            <strong>Don't worry:</strong>
          </Text>
          <ul className="!text-red-800 !text-sm space-y-1.5">
            <li>• If you were charged, the funds will be in your wallet</li>
            <li>• If not charged, no money left your account</li>
            <li>• Check your bank statement to confirm</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            size="large"
            onClick={() => router.push("/dashboard/wallet")}
            className="!h-11 !rounded-lg !flex-1"
          >
            Check Wallet
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={retryVerification}
            className="!bg-gray-900 hover:!bg-gray-800 !border-0 !h-11 !rounded-lg !flex-1"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
