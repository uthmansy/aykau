"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import DisputeResolution from "@/components/ui/disputes/admin/DisputeResolution";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const disputeId =
    typeof params?.id === "string" && params.id !== "undefined"
      ? params.id
      : null;

  if (!disputeId) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
          <WarningOutlined className="text-error text-2xl" />
        </div>
        <h2 className="font-manrope text-[24px] font-semibold text-primary mb-2">
          Invalid Dispute ID
        </h2>
        <p className="font-inter text-[16px] text-on-surface-variant mb-8 max-w-md">
          The dispute you are looking for does not exist or the URL is
          malformed.
        </p>
        <Button
          onClick={() => router.push("/admin/disputes")}
          className="rounded-lg! h-auto! py-3! px-6! bg-secondary! hover:bg-secondary/90! border-none! text-on-secondary! font-inter! text-[14px]! font-medium! shadow-lg! shadow-secondary/20!"
        >
          ← Back to Disputes Dashboard
        </Button>
      </div>
    );
  }

  return (
    <AdminGuard>
      <DisputeResolution disputeId={disputeId} />
    </AdminGuard>
  );
}
