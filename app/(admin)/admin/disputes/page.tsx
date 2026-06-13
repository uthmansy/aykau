// app/admin/disputes/page.tsx
"use client";

import DisputesDashboard from "@/components/ui/disputes/admin/DisputesDashboard";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminDisputesPage() {
  return (
    <AdminGuard>
      <DisputesDashboard />
    </AdminGuard>
  );
}
