"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "antd";
import { supabase } from "@/services/supabase/client";
import DisputeThread from "@/components/ui/disputes/DisputeThread";
import EvidenceGallery from "@/components/ui/disputes/EvidenceGallery";
import DisputeBanner from "@/components/ui/disputes/DisputeBanner";

export default function DisputeDetailPage() {
  const params = useParams();
  const disputeId = params.id as string;
  const [dispute, setDispute] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"thread" | "evidence">("thread");

  useEffect(() => {
    fetchDispute();
  }, [disputeId]);

  const fetchDispute = async () => {
    const { data } = await supabase
      .from("disputes")
      .select("*")
      .eq("id", disputeId)
      .single();
    setDispute(data);
  };

  if (!dispute) return null;

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-6">
      <DisputeBanner
        dispute={dispute}
        onWithdraw={() => window.location.reload()}
      />

      <div className="bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-level-1)] border border-outline-variant/20 overflow-hidden">
        {/* Custom Tabs Header using AntD Buttons */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/30 flex gap-2">
          <Button
            type={activeTab === "thread" ? "primary" : "default"}
            onClick={() => setActiveTab("thread")}
            className={`rounded-lg! h-auto! py-2! px-5! font-inter! text-[14px]! font-medium! transition-all ${
              activeTab === "thread"
                ? "bg-primary! hover:bg-primary/90! border-none! text-on-primary!"
                : "bg-surface-container! hover:bg-surface-container-high! border-outline-variant! text-on-surface-variant!"
            }`}
          >
            Discussion
          </Button>
          <Button
            type={activeTab === "evidence" ? "primary" : "default"}
            onClick={() => setActiveTab("evidence")}
            className={`rounded-lg! h-auto! py-2! px-5! font-inter! text-[14px]! font-medium! transition-all ${
              activeTab === "evidence"
                ? "bg-primary! hover:bg-primary/90! border-none! text-on-primary!"
                : "bg-surface-container! hover:bg-surface-container-high! border-outline-variant! text-on-surface-variant!"
            }`}
          >
            Evidence
          </Button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "thread" ? (
            <DisputeThread disputeId={disputeId} />
          ) : (
            <EvidenceGallery disputeId={disputeId} />
          )}
        </div>
      </div>
    </div>
  );
}
