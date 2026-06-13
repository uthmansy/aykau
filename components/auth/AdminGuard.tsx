// components/auth/AdminGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase/client";
import { Spin } from "antd";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Redirect to your login page
        return;
      }

      // 2. Check if user has 'admin' role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        // Not an admin, redirect to regular dashboard or home
        router.push("/dashboard");
        return;
      }

      // Is an admin
      setIsAuthorized(true);
    };

    checkAdmin();
  }, [router]);

  // Show loading spinner while checking
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Verifying admin access..." />
      </div>
    );
  }

  // If not authorized, render nothing (the useEffect already redirected)
  if (!isAuthorized) {
    return null;
  }

  // Render the protected admin content
  return <>{children}</>;
}
