"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { App, Button } from "antd";
import { ForwardOutlined } from "@ant-design/icons";
import AuthLayout from "@/components/layout/AuthLayout";
import GoogleButton from "@/components/ui/auth/GoogleButton";
import AuthDivider from "@/components/ui/auth/AuthDivider";
import AuthInput from "@/components/ui/auth/AuthInput";
import RoleToggle from "@/components/ui/auth/RoleToggle";
import { registerSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth/auth.service";

type Role = "customer" | "artisan";

export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = registerSchema.safeParse({
      email,
      password,
      fullName,
      role,
    });
    if (!result.success) {
      const fieldErrors: {
        fullName?: string;
        email?: string;
        password?: string;
      } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
        if (issue.path[0] === "fullName") fieldErrors.fullName = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await authService.register(
      email,
      password,
      fullName,
      role
    );

    if (error) {
      message.error(error.message);
      setLoading(false);
      return;
    }

    message.success(
      "Account created! Please check your email to verify your account."
    );
    router.push("/login");
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    const { error } = await authService.signInWithGoogle();
    if (error) {
      message.error(error.message);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join the elite network of artisans and clients."
    >
      {/* Google Signup */}
      <GoogleButton action="signup" onClick={handleGoogleSignup} />

      <AuthDivider />

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <RoleToggle value={role} onChange={setRole} />

        {/* Full Name */}
        <AuthInput
          label="Full Name"
          type="text"
          icon="person"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />

        {/* Email */}
        <AuthInput
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        {/* Password */}
        <AuthInput
          label="Password"
          type="password"
          icon="lock"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {/* Submit Button */}
        <div className="pt-4">
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
            {loading ? "Creating account..." : "Get Started"}
          </Button>
        </div>
      </form>

      {/* Login Link */}
      <div className="text-center pt-4">
        <p className="font-inter text-label-md text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>

      {/* Terms */}
      <div className="mt-8 pt-4 border-t border-outline-variant/30">
        <p className="font-inter text-label-sm text-center text-outline leading-relaxed">
          By creating an account, you agree to our{" "}
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
