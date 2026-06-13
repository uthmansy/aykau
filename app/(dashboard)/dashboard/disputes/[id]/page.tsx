"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Tabs, Typography } from "antd";
import { supabase } from "@/services/supabase/client";
import DisputeThread from "@/components/ui/disputes/DisputeThread";
import EvidenceGallery from "@/components/ui/disputes/EvidenceGallery";
import DisputeBanner from "@/components/ui/disputes/DisputeBanner";

const { Title } = Typography;

export default function DisputeDetailPage() {
  const params = useParams();
  const disputeId = params.id as string;
  const [dispute, setDispute] = useState<any>(null);

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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <DisputeBanner
        dispute={dispute}
        onWithdraw={() => window.location.reload()}
      />

      <Card>
        <Tabs
          defaultActiveKey="thread"
          items={[
            {
              key: "thread",
              label: "Discussion",
              children: <DisputeThread disputeId={disputeId} />,
            },
            {
              key: "evidence",
              label: "Evidence",
              children: <EvidenceGallery disputeId={disputeId} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}
