"use client";

import { useEffect, useState } from "react";
import { Typography, InputNumber, Button, App, Modal } from "antd";
import { SettingOutlined, PercentageOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

const { Title, Text } = Typography;

interface Props {
  onRefresh?: () => void;
}

export default function PlatformFeeSettings({ onRefresh }: Props) {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [currentFee, setCurrentFee] = useState<number>(10);
  const [newFee, setNewFee] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFee();
  }, []);

  const fetchFee = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_platform_setting", {
        p_key: "platform_fee_percentage",
      });
      if (error) throw error;
      setCurrentFee(data?.percentage || 10);
    } catch (error) {
      console.error("Error fetching fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = () => {
    if (newFee === null || newFee === currentFee) return;

    modal.confirm({
      title: (
        <span className="font-manrope! text-primary!">
          Update Platform Fee?
        </span>
      ),
      content: (
        <div className="font-inter!">
          <Text className="text-on-surface!">
            You are about to change the platform fee from{" "}
            <strong>{currentFee}%</strong> to <strong>{newFee}%</strong>.
          </Text>
          <br />
          <Text className="text-on-surface-variant! text-xs! mt-2! block!">
            This will affect all new contracts created after this change.
          </Text>
        </div>
      ),
      okText: "Yes, Update",
      okButtonProps: {
        className: "bg-secondary! border-secondary! hover:bg-secondary/90!",
      },
      cancelButtonProps: { className: "border-outline! text-on-surface!" },
      onOk: async () => {
        setSaving(true);
        try {
          const { error } = await supabase.rpc("update_platform_setting", {
            p_key: "platform_fee_percentage",
            p_value: {
              percentage: newFee,
              description: "Platform fee percentage charged on all contracts",
            },
            p_description: "Platform fee percentage charged on all contracts",
          });
          if (error) throw error;
          message.success("Platform fee updated!");
          setCurrentFee(newFee);
          setNewFee(null);
          onRefresh?.();
        } catch (error: any) {
          message.error(error.message || "Failed to update fee.");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  return (
    <div className="bg-surface-container-lowest! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]! p-6!">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <SettingOutlined className="text-secondary! text-lg!" />
        </div>
        <Title
          level={5}
          className="font-headline-md text-headline-md text-primary! mb-0!"
        >
          Platform Settings
        </Title>
      </div>

      <div className="space-y-4">
        {/* Current Fee Display */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-xs! font-inter! font-semibold! uppercase! tracking-wider! text-on-surface-variant!">
              Current Platform Fee
            </Text>
            <PercentageOutlined className="text-primary! text-lg!" />
          </div>
          <div className="flex items-baseline gap-1">
            <Text className="font-manrope! text-[32px]! font-bold! text-primary!">
              {currentFee}
            </Text>
            <Text className="font-manrope! text-[20px]! text-primary!">%</Text>
          </div>
          <Text className="text-xs! text-on-surface-variant! mt-2! block!">
            Charged on all contracts
          </Text>
        </div>

        {/* Update Fee Input */}
        <div>
          <Text className="text-sm! font-inter! font-medium! text-on-surface! mb-2! block!">
            Update Fee Percentage
          </Text>
          <InputNumber
            value={newFee}
            onChange={(val) => setNewFee(val)}
            min={0}
            max={100}
            step={0.5}
            placeholder={currentFee.toString()}
            className="w-full! rounded-lg! h-11!"
            addonAfter="%"
          />
        </div>

        <Button
          type="primary"
          block
          size="large"
          onClick={handleUpdateFee}
          loading={saving}
          disabled={newFee === null || newFee === currentFee}
          className="bg-secondary! border-secondary! text-white! font-inter! font-semibold! rounded-lg! h-11! hover:bg-secondary/90! disabled:bg-outline-variant! disabled:text-on-surface-variant!"
        >
          Update Fee
        </Button>

        <Text className="text-xs! text-on-surface-variant! text-center! block!">
          Changes apply to new contracts only
        </Text>
      </div>
    </div>
  );
}
