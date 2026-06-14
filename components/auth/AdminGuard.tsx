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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsAuthorized(true);
    };

    checkAdmin();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
        <Spin size="large" />
        <p className="font-inter text-[14px] text-on-surface-variant">
          Verifying admin access...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
