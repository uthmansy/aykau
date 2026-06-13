// components/ui/disputes/DisputeBanner.tsx
"use client";

import { Alert, Button, Tag, Typography } from "antd";
import { WarningOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

const { Text } = Typography;

interface Props {
  dispute: {
    id: string;
    status: string;
    raised_by: string;
    amount_disputed: number;
  };
  onWithdraw?: () => void;
}

export default function DisputeBanner({ dispute, onWithdraw }: Props) {
  const userId = useAuthStore((state) => state.user?.id);
  const isRaiser = dispute.raised_by === userId;

  const handleWithdraw = async () => {
    try {
      const { error } = await supabase.rpc("withdraw_dispute", {
        p_dispute_id: dispute.id,
      });

      if (error) throw error;

      onWithdraw?.();
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  const getStatusConfig = () => {
    switch (dispute.status) {
      case "mediation":
        return {
          color: "orange",
          message: "Dispute in Mediation",
          description:
            "Both parties have 48 hours to resolve this dispute. Escrow funds are frozen.",
        };
      case "under_review":
        return {
          color: "red",
          message: "Dispute Under Admin Review",
          description:
            "An admin is reviewing this dispute. Escrow funds remain frozen.",
        };
      case "resolved":
        return {
          color: "green",
          message: "Dispute Resolved",
          description: "This dispute has been resolved by admin.",
        };
      case "withdrawn":
        return {
          color: "gray",
          message: "Dispute Withdrawn",
          description: "This dispute was withdrawn. Escrow funds are unfrozen.",
        };
      default:
        return {
          color: "blue",
          message: "Dispute",
          description: "",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Alert
      type={
        config.color === "orange"
          ? "warning"
          : config.color === "red"
            ? "error"
            : config.color === "green"
              ? "success"
              : "info"
      }
      showIcon
      icon={
        dispute.status === "resolved" || dispute.status === "withdrawn" ? (
          <CloseCircleOutlined />
        ) : (
          <WarningOutlined />
        )
      }
      message={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Text strong>{config.message}</Text>
            <Tag color={config.color}>{dispute.status.toUpperCase()}</Tag>
          </div>
          {isRaiser &&
            (dispute.status === "mediation" ||
              dispute.status === "under_review") && (
              <Button
                size="small"
                onClick={handleWithdraw}
                className="!border-gray-400 !text-gray-700"
              >
                Withdraw Dispute
              </Button>
            )}
        </div>
      }
      description={
        <div>
          <Text>{config.description}</Text>
          <div className="mt-2">
            <Text className="text-gray-600">
              Amount frozen:{" "}
              <strong>₦{dispute.amount_disputed.toLocaleString()}</strong>
            </Text>
          </div>
        </div>
      }
      className="!rounded-lg !mb-4"
    />
  );
}
