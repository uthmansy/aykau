"use client";

import { useState } from "react";
import Link from "next/link";
import { App, Button } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  ForwardOutlined,
} from "@ant-design/icons";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthInput from "@/components/ui/auth/AuthInput";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth/auth.service";

export default function ForgotPasswordPage() {
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setErrors({ email: result.error.issues[0].message });
      return;
    }

    setLoading(true);

    const { error } = await authService.resetPassword(email);

    if (error) {
      message.error(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent a password reset link to your email address."
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MailOutlined className="text-primary text-3xl" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-inter text-body-md text-on-surface-variant mb-2">
              We sent a reset link to
            </p>
            <p className="font-inter text-label-md font-semibold text-on-surface">
              {email}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="primary"
              block
              size="large"
              onClick={() => setSent(false)}
              icon={<ReloadOutlined />}
              className="h-12! bg-primary! hover:bg-primary-container! border-none! rounded-lg! font-inter! text-label-md! font-bold! shadow-lg!"
            >
              Resend Email
            </Button>

            <Link href="/login">
              <Button
                block
                size="large"
                className="h-12! bg-surface-container! text-on-surface! border-none! rounded-lg! font-inter! text-label-md! font-bold! hover:bg-surface-container-high!"
              >
                Back to Login
              </Button>
            </Link>
          </div>

          <p className="font-inter text-label-sm text-center text-outline">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setSent(false)}
              className="text-primary font-bold hover:underline"
            >
              try again
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          icon={!loading ? <ForwardOutlined /> : undefined}
          iconPosition="end"
          className="h-12! bg-primary! hover:bg-primary-container! border-none! rounded-lg! font-inter! text-label-md! font-bold! shadow-lg! hover:shadow-primary/20!"
        >
          {loading ? "Sending..." : "Send Reset Link"}
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
