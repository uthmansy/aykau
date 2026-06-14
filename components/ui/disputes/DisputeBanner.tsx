"use client";

import { Button } from "antd";
import {
  WarningOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

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

  const config = {
    mediation: {
      bg: "bg-warning/5",
      border: "border-warning/20",
      text: "text-warning",
      icon: <WarningOutlined />,
      msg: "Dispute in Mediation",
      desc: "Both parties have 48 hours to resolve this dispute. Escrow funds are frozen.",
    },
    under_review: {
      bg: "bg-error/5",
      border: "border-error/20",
      text: "text-error",
      icon: <WarningOutlined />,
      msg: "Dispute Under Admin Review",
      desc: "An admin is reviewing this dispute. Escrow funds remain frozen.",
    },
    resolved: {
      bg: "bg-success-emerald/5",
      border: "border-success-emerald/20",
      text: "text-success-emerald",
      icon: <CheckCircleOutlined />,
      msg: "Dispute Resolved",
      desc: "This dispute has been resolved by admin.",
    },
    withdrawn: {
      bg: "bg-on-surface-variant/5",
      border: "border-on-surface-variant/20",
      text: "text-on-surface-variant",
      icon: <CloseCircleOutlined />,
      msg: "Dispute Withdrawn",
      desc: "This dispute was withdrawn. Escrow funds are unfrozen.",
    },
  }[dispute.status] || {
    bg: "bg-primary/5",
    border: "border-primary/20",
    text: "text-primary",
    icon: <WarningOutlined />,
    msg: "Dispute",
    desc: "",
  };

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-2xl p-5 mb-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${config.text} text-xl`}>{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h4
              className={`font-inter text-[14px] font-semibold ${config.text}`}
            >
              {config.msg}
            </h4>
            <span
              className={`px-2.5 py-0.5 rounded-full font-inter text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}
            >
              {dispute.status.replace("_", " ")}
            </span>
          </div>
          <p
            className={`font-inter text-[12px] ${config.text} opacity-90 mb-2`}
          >
            {config.desc}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className={`font-inter text-[12px] ${config.text}`}>
              Amount frozen:{" "}
              <strong>₦{dispute.amount_disputed.toLocaleString()}</strong>
            </span>
            {isRaiser &&
              (dispute.status === "mediation" ||
                dispute.status === "under_review") && (
                <Button
                  size="small"
                  onClick={handleWithdraw}
                  className="!rounded-lg! !border-outline-variant/30! !text-on-surface-variant! hover:!border-primary! hover:!text-primary! bg-transparent! font-inter! text-[12px]! font-medium!"
                >
                  Withdraw Dispute
                </Button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
