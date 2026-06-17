// components/profile/MessageArtisanButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Button, App } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  artisanId: string;
  variant?: "primary" | "secondary" | "icon";
  size?: "small" | "middle" | "large";
  className?: string;
  onSuccess?: (conversationId: string) => void;
}

export default function MessageArtisanButton({
  artisanId,
  variant = "secondary",
  size = "middle",
  className = "",
  onSuccess,
}: Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    checkUser();
  }, []);

  const handleMessage = async () => {
    if (!currentUserId) {
      return message.warning("Please log in to message this artisan.");
    }

    if (currentUserId === artisanId) {
      return message.warning("You cannot message yourself.");
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("start_general_conversation", {
        p_artisan_id: artisanId,
      });

      if (error) throw error;

      message.success("Opening conversation...");
      onSuccess?.(data.conversation_id);
      router.push(`/dashboard/messages?c=${data.conversation_id}`);
    } catch (error: any) {
      console.error("Message error:", error);
      message.error("Failed to start conversation.");
    } finally {
      setLoading(false);
    }
  };

  // Variant styles
  const variantClasses = {
    primary:
      "bg-secondary! text-on-secondary! border-secondary! hover:bg-secondary/90! shadow-[var(--shadow-level-1)]!",
    secondary:
      "bg-transparent! border-primary! text-primary! hover:bg-primary/5!",
    icon: "bg-transparent! border-outline-variant! text-on-surface-variant! hover:border-primary! hover:text-primary!",
  };

  // Size classes
  const sizeClasses = {
    small: "h-8! px-3! text-xs!",
    middle: "h-11! px-6! text-sm!",
    large: "h-12! px-8! text-base!",
  };

  if (variant === "icon") {
    return (
      <Button
        icon={<MessageOutlined />}
        onClick={handleMessage}
        loading={loading}
        size={size}
        className={`rounded-lg! ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <Button
      icon={<MessageOutlined />}
      onClick={handleMessage}
      loading={loading}
      size={size}
      className={`rounded-lg! font-inter! font-medium! flex items-center gap-2! ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? "Opening..." : "Message"}
    </Button>
  );
}
