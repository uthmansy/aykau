// components/reviews/ReviewModal.tsx
"use client";

import { useState } from "react";
import { Modal, Input, Button, App } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

const { TextArea } = Input;

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  onSuccess: () => void;
}

export default function ReviewModal({
  open,
  onClose,
  contractId,
  onSuccess,
}: Props) {
  const { message } = App.useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      return message.warning("Please select a rating.");
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc("submit_review", {
        p_contract_id: contractId,
        p_rating: rating,
        p_comment: comment || null,
      });

      if (error) {
        if (error.message.includes("already_reviewed")) {
          message.info("You have already reviewed this job.");
        } else {
          throw error;
        }
      } else {
        message.success("Review submitted successfully! Thank you.");
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      console.error("Review error:", error);
      message.error(error.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
      styles={{
        body: { padding: 0, borderRadius: "16px", overflow: "hidden" },
      }}
    >
      <div className="bg-surface-container-lowest p-6 md:p-8">
        <h3 className="font-manrope text-xl font-semibold text-primary mb-2 text-center">
          How was your experience?
        </h3>
        <p className="text-on-surface-variant font-inter text-sm text-center mb-6">
          Your feedback helps us maintain high standards on Luminous
          Marketplace.
        </p>

        {/* Interactive Star Rating */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              {(hoverRating || rating) >= star ? (
                <StarFilled className="text-[32px] text-secondary drop-shadow-sm" />
              ) : (
                <StarOutlined className="text-[32px] text-outline-variant" />
              )}
            </button>
          ))}
        </div>

        {/* Comment Input */}
        <div className="mb-6">
          <label className="block text-sm font-inter font-medium text-on-surface mb-2">
            Leave a comment (Optional)
          </label>
          <TextArea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about the quality of work, communication, etc..."
            className="rounded-lg! border-outline-variant! hover:border-primary! focus:border-primary! resize-none! font-inter!"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            block
            className="rounded-lg! h-11! font-inter! border-outline! text-on-surface! hover:border-primary! hover:text-primary!"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={rating === 0}
            block
            className="rounded-lg! h-11! bg-secondary! border-secondary! font-inter! font-semibold! hover:bg-secondary/90! disabled:bg-outline-variant! disabled:text-on-surface-variant!"
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );
}
