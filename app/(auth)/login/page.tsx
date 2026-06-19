"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { App, Button } from "antd";
import { ForwardOutlined } from "@ant-design/icons";
import AuthLayout from "@/components/layout/AuthLayout";
import GoogleButton from "@/components/ui/auth/GoogleButton";
import AuthDivider from "@/components/ui/auth/AuthDivider";
import AuthInput from "@/components/ui/auth/AuthInput";
import { loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const setUser = useAuthStore((s) => s.setUser);
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authService.login(email, password);

      if (error) {
        message.error(error.message || "Login failed");
        setLoading(false);
        return;
      }

      if (!data?.user) {
        message.error("No user data received");
        setLoading(false);
        return;
      }

      message.success("Login successful");
      //@ts-ignore
      setUser(data.user);

      // Use window.location for hard redirect to ensure middleware sees the new session
      window.location.href = redirect;
    } catch (err) {
      message.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await authService.signInWithGoogle();
    if (error) {
      message.error(error.message);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your account to continue."
    >
      {/* Google Login */}
      <GoogleButton action="login" onClick={handleGoogleLogin} />

      <AuthDivider />

      {/* Email/Password Form */}
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

        <AuthInput
          label="Password"
          type="password"
          icon="lock"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="font-inter text-[12px] font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button - Primary CTA uses Secondary (Coral Orange) fill per DESIGN.md */}
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          icon={!loading ? <ForwardOutlined /> : undefined}
          iconPosition="end"
          className="h-12! bg-secondary! hover:bg-secondary/90! border-none! rounded-lg! font-inter! text-[14px]! font-medium! text-on-secondary! shadow-lg! shadow-secondary/20!"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center pt-4">
        <p className="font-inter text-[14px] text-on-surface-variant">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Terms */}
      <div className="mt-8 pt-4 border-t border-outline-variant/30">
        <p className="font-inter text-[12px] text-center text-outline leading-relaxed">
          By logging in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
