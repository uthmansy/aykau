"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth/auth.service";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("customer" | "artisan" | "admin")[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        // Check role access
        if (
          allowedRoles &&
          !allowedRoles.includes(user.role as "customer" | "artisan" | "admin")
        ) {
          router.push("/dashboard");
          return;
        }
        setLoading(false);
        return;
      }

      const { data, error } = await authService.getUser();

      if (error || !data?.user) {
        router.push("/login");
        return;
      }

      //@ts-ignore
      setUser(data.user);

      // Check role access
      if (
        allowedRoles &&
        !allowedRoles.includes(
          data.user.role as "customer" | "artisan" | "admin"
        )
      ) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [user, setUser, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
