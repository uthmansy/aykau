// components/profile/RequestQuoteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Button, App } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import RequestQuoteModal from "./RequestQuoteModal";

interface Props {
  artisanId: string;
  artisanName: string;
  preferredSubcategories?: string[];
  variant?: "primary" | "secondary" | "icon";
  size?: "small" | "middle" | "large";
  className?: string;
  onSuccess?: (conversationId: string, jobId: string) => void;
}

export default function RequestQuoteButton({
  artisanId,
  artisanName,
  preferredSubcategories = [],
  variant = "primary",
  size = "middle",
  className = "",
  onSuccess,
}: Props) {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleClick = () => {
    if (!currentUserId) {
      return message.warning("Please log in to request a quote.");
    }
    setIsModalOpen(true);
  };

  const handleModalSuccess = (conversationId: string, jobId: string) => {
    setIsModalOpen(false);
    onSuccess?.(conversationId, jobId);
  };

  // Variant styles
  const variantClasses = {
    primary:
      "bg-secondary! text-on-secondary! border-secondary! hover:bg-secondary/90! text-white! shadow-[var(--shadow-level-1)]!",
    secondary:
      "bg-transparent! border-primary! text-primary! hover:bg-primary/5!",
    icon: "bg-transparent! border-outline-variant! text-on-surface-variant! hover:border-secondary! hover:text-secondary!",
  };

  // Size classes
  const sizeClasses = {
    small: "h-8! px-3! text-xs!",
    middle: "h-11! px-6! text-sm!",
    large: "h-12! px-8! text-base!",
  };

  if (variant === "icon") {
    return (
      <>
        <Button
          icon={<ThunderboltOutlined />}
          onClick={handleClick}
          size={size}
          className={`rounded-lg! ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        />
        {isModalOpen && (
          <RequestQuoteModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            artisanId={artisanId}
            artisanName={artisanName}
            preferredSubcategories={preferredSubcategories}
            onSuccess={handleModalSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        icon={<ThunderboltOutlined />}
        onClick={handleClick}
        size={size}
        className={`rounded-lg! font-inter! font-medium! flex items-center gap-2! ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        Request a Quote
      </Button>
      {isModalOpen && (
        <RequestQuoteModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          artisanId={artisanId}
          artisanName={artisanName}
          preferredSubcategories={preferredSubcategories}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
