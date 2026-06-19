"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { App, Button, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import AuthLayout from "@/components/layout/AuthLayout";
import { supabase } from "@/services/supabase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("No verification code found");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setError("Invalid or expired verification link");
        setLoading(false);
        return;
      }

      setVerified(true);
      setLoading(false);
    };

    verifyEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <AuthLayout
        title="Verifying your email..."
        subtitle="Please wait while we verify your email address."
      >
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout title="Verification failed" subtitle={error}>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <CloseCircleOutlined className="text-error text-3xl" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-inter text-body-md text-on-surface-variant">
              The verification link may have expired or been already used.
            </p>
          </div>

          <Link href="/login">
            <Button
              type="primary"
              block
              size="large"
              className="h-12! bg-primary! hover:bg-primary-container! border-none! rounded-lg! font-inter! text-label-md! font-bold! shadow-lg!"
            >
              Go to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (verified) {
    return (
      <AuthLayout
        title="Email verified!"
        subtitle="Your email has been successfully verified."
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircleOutlined className="text-success text-3xl" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-inter text-body-md text-on-surface-variant">
              You can now access all features of your account.
            </p>
          </div>

          <Link href="/dashboard">
            <Button
              type="primary"
              block
              size="large"
              className="h-12! bg-primary! hover:bg-primary-container! border-none! rounded-lg! font-inter! text-label-md! font-bold! shadow-lg!"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
