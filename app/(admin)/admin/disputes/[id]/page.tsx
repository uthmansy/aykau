// app/admin/disputes/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Spin } from "antd";
import DisputeResolution from "@/components/ui/disputes/admin/DisputeResolution";
import AdminGuard from "@/components/auth/AdminGuard"; // We will create this next

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Safely extract the ID, ensuring it's a valid string and not the literal "undefined"
  const disputeId =
    typeof params?.id === "string" && params.id !== "undefined"
      ? params.id
      : null;

  if (!disputeId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-12">
        <Alert
          message="Invalid Dispute ID"
          description="The dispute you are looking for does not exist or the URL is malformed."
          type="error"
          showIcon
          className="max-w-md"
        />
        <button
          onClick={() => router.push("/admin/disputes")}
          className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Disputes Dashboard
        </button>
      </div>
    );
  }

  return (
    <AdminGuard>
      <DisputeResolution disputeId={disputeId} />
    </AdminGuard>
  );
}
