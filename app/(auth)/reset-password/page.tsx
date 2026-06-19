"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { App, Button } from "antd";
import {
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthInput from "@/components/ui/auth/AuthInput";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth/auth.service";
import { supabase } from "@/services/supabase/client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check if user has a valid session when the page loads
  useEffect(() => {
    const checkSession = async () => {
      // Wait for session to be established after auth callback redirect
      // Try multiple times with increasing delays to handle cookie propagation
      const delays = [500, 1000, 2000, 3000];

      for (const delay of delays) {
        await new Promise((resolve) => setTimeout(resolve, delay));

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("Reset password session check:", { session, error, delay });

        if (session && !error) {
          setSessionChecked(true);
          return;
        }
      }

      // If we get here, no session was found after all attempts
      message.error("Invalid or expired reset link. Please request a new one.");
      router.push("/forgot-password");
    };

    checkSession();
  }, [searchParams, message, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
        if (issue.path[0] === "confirmPassword")
          fieldErrors.confirmPassword = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await authService.updatePassword(password);

    if (error) {
      message.error(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout
        title="Password reset!"
        subtitle="Your password has been successfully updated."
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircleOutlined className="text-success text-3xl" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-inter text-body-md text-on-surface-variant">
              You can now log in with your new password.
            </p>
          </div>

          <Link href="/login">
            <Button
              type="primary"
              block
              size="large"
              className="h-12! bg-primary! hover:bg-primary-container! border-none! rounded-lg! font-inter! text-label-md! font-bold! shadow-lg!"
            >
              Log In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Show loading while checking session
  if (!sessionChecked) {
    return (
      <AuthLayout
        title="Reset password"
        subtitle="Verifying your reset link..."
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your new password below."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="New Password"
          type="password"
          icon="lock"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          icon="lock"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          icon={!loading ? <CheckOutlined /> : undefined}
          className="h-12! bg-primary! hover:bg-primary-container! border-none! rounded-lg! font-inter! text-label-md! font-bold! shadow-lg! hover:shadow-primary/20!"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <div className="text-center pt-4">
        <Link
          href="/login"
          className="font-inter text-label-md text-primary font-bold hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeftOutlined className="text-sm" />
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
