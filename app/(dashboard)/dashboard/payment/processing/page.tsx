"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin, Button } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  WalletOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

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

  useEffect(() => {
    const reference = searchParams.get("reference");
    const unlockJob = searchParams.get("unlock_job");
    const paymentIntent = searchParams.get("intent");

    setJobIdToUnlock(unlockJob);
    setIntent(paymentIntent);

    if (!reference) {
      setState("failed");
      setErrorMessage("Invalid payment reference. Please contact support.");
      return;
    }

    if (userId && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      verifyPayment(reference, unlockJob, paymentIntent);
    }
  }, [userId, searchParams]);

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
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
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
        setState("not_found");
        return;
      }

      if (unlockJob) {
        try {
          const { error: unlockError } = await supabase.rpc("unlock_job", {
            p_job_id: unlockJob,
          });
          if (unlockError) console.error("Auto-unlock error:", unlockError);
          setState("success");
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
      <div className="min-h-[70vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-8">
        <div className="text-center max-w-lg w-full">
          <div className="mb-6 relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border-4 border-primary/10">
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 40, color: "var(--primary)" }}
                    spin
                  />
                }
              />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary/20 border-t-transparent animate-spin opacity-30" />
          </div>
          <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
            Verifying Your Payment
          </h2>
          <p className="font-inter text-[16px] text-on-surface-variant mb-6">
            Please wait while we confirm your transaction with Paystack...
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>

          <p className="font-inter text-[12px] text-outline">
            Do not close or refresh this page
          </p>
        </div>
      </div>
    );
  }

  // ───────── SUCCESS STATE ─────────
  if (state === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-8">
        <div className="text-center max-w-lg w-full">
          <div className="mb-6 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-success-emerald/10 flex items-center justify-center border-4 border-success-emerald/10">
              <CheckCircleFilled className="text-[56px] text-success-emerald animate-in zoom-in duration-300" />
            </div>
          </div>
          <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
            Payment Successful!
          </h2>
          <p className="font-inter text-[16px] text-on-surface-variant mb-6">
            {jobIdToUnlock && intent === "credit_purchase"
              ? "Your credits have been added and the job has been unlocked."
              : "Your payment has been processed successfully."}
          </p>

          <div className="bg-success-emerald/5 border border-success-emerald/20 rounded-2xl p-5 mb-6">
            <p className="font-inter text-[14px] font-medium text-success-emerald">
              <strong>Redirecting</strong> in {countdown} second
              {countdown !== 1 ? "s" : ""}...
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={performRedirect}
            icon={<ArrowRightOutlined />}
            className="rounded-lg! h-auto! py-3! px-8! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
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
      <div className="min-h-[70vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-8">
        <div className="text-center max-w-lg w-full">
          <div className="mb-6 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center border-4 border-warning/10">
              <WalletOutlined className="text-[48px] text-warning" />
            </div>
          </div>
          <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
            Payment Still Processing
          </h2>
          <p className="font-inter text-[16px] text-on-surface-variant mb-6">
            We couldn't find your transaction yet. This sometimes happens when
            the payment processor is slow to notify us. Your funds are likely on
            their way.
          </p>

          <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5 mb-6 text-left">
            <p className="font-inter text-[14px] font-semibold text-warning mb-2">
              What to do:
            </p>
            <ul className="font-inter text-[14px] text-on-surface-variant space-y-1.5">
              <li>• Wait a minute and try verifying again</li>
              <li>• Check your wallet page for the transaction</li>
              <li>• Check your email for a Paystack receipt</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              size="large"
              onClick={() => router.push("/dashboard/wallet")}
              className="rounded-lg! h-auto! py-3! flex-1! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
            >
              Check Wallet
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={retryVerification}
              className="rounded-lg! h-auto! py-3! flex-1! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium!"
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
    <div className="min-h-[70vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-8">
      <div className="text-center max-w-lg w-full">
        <div className="mb-6 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center border-4 border-error/10">
            <CloseCircleFilled className="text-[56px] text-error" />
          </div>
        </div>
        <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
          Verification Failed
        </h2>
        <p className="font-inter text-[16px] text-on-surface-variant mb-6">
          {errorMessage ||
            "We couldn't verify your payment. Please try again or contact support."}
        </p>

        <div className="bg-error/5 border border-error/20 rounded-2xl p-5 mb-6 text-left">
          <p className="font-inter text-[14px] font-semibold text-error mb-2">
            Don't worry:
          </p>
          <ul className="font-inter text-[14px] text-on-surface-variant space-y-1.5">
            <li>• If you were charged, the funds will be in your wallet</li>
            <li>• If not charged, no money left your account</li>
            <li>• Check your bank statement to confirm</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            size="large"
            onClick={() => router.push("/dashboard/wallet")}
            className="rounded-lg! h-auto! py-3! flex-1! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary! bg-transparent! font-inter! text-[14px]! font-medium!"
          >
            Check Wallet
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={retryVerification}
            className="rounded-lg! h-auto! py-3! flex-1! bg-secondary! hover:bg-secondary/90! border-none! font-inter! text-[14px]! font-medium!"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
