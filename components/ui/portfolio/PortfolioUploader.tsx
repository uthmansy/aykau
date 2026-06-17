// components/portfolio/PortfolioUploader.tsx
"use client";

import { useState, useRef } from "react";
import { Button, Input, Select, App, Spin, Modal } from "antd";
import {
  CloudUploadOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

const { TextArea } = Input;

interface Props {
  onSuccess: () => void;
  currentCount: number;
}

export default function PortfolioUploader({ onSuccess, currentCount }: Props) {
  const { message } = App.useApp();
  const userId = useAuthStore((state) => state.user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const CATEGORIES = [
    "Kitchen Remodel",
    "Bathroom Fix",
    "Electrical Wiring",
    "Plumbing",
    "Painting",
    "Carpentry",
    "Landscaping",
    "Other",
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation
    const isVideo = selectedFile.type.startsWith("video/");
    const isImage = selectedFile.type.startsWith("image/");

    if (!isVideo && !isImage) {
      return message.error("Only images and videos are allowed.");
    }
    if (isImage && selectedFile.size > 10 * 1024 * 1024) {
      return message.error("Image size must be less than 10MB.");
    }
    if (isVideo && selectedFile.size > 50 * 1024 * 1024) {
      return message.error("Video size must be less than 50MB.");
    }
    if (currentCount >= 15) {
      return message.error(
        "You have reached the maximum limit of 15 portfolio items."
      );
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file || !userId || !formData.title) {
      return message.warning("Please select a file and enter a title.");
    }

    setUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolios")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("portfolios")
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // 3. Save to Database via RPC
      const { error: dbError } = await supabase.rpc("upsert_portfolio_item", {
        p_artisan_id: userId,
        p_type: file.type.startsWith("video/") ? "video" : "image",
        p_file_url: publicUrl,
        p_title: formData.title,
        p_description: formData.description || null,
        p_category: formData.category || null,
        p_file_size_bytes: file.size,
      });

      if (dbError) throw dbError;

      message.success("Portfolio item added successfully!");

      // Reset form
      setFile(null);
      setPreview(null);
      setFormData({ title: "", description: "", category: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      message.error(error.message || "Failed to upload portfolio item.");
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-surface-container-lowest! rounded-2xl! shadow-[0_4px_20px_rgba(0,0,0,0.04)]! p-6! md:p-8!">
      <h3 className="font-manrope! text-xl! font-semibold! text-primary! mb-6!">
        Add to Portfolio
      </h3>

      {!preview ? (
        // Dropzone
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2! border-dashed! border-outline-variant! rounded-xl! p-10! flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary! hover:bg-primary/5! transition-all!"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CloudUploadOutlined className="text-3xl! text-primary!" />
          </div>
          <p className="font-inter! text-base! font-medium! text-on-surface! mb-1!">
            Click to upload or drag and drop
          </p>
          <p className="font-inter! text-sm! text-on-surface-variant!">
            SVG, PNG, JPG or MP4 (max 10MB for images, 50MB for video)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        // Preview & Form
        <div className="space-y-6">
          <div className="relative rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 max-h-64 flex items-center justify-center">
            {file?.type.startsWith("video/") ? (
              <video src={preview} className="max-h-64" controls />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 object-contain"
              />
            )}
            <button
              onClick={clearSelection}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/90 transition-colors"
            >
              <CloseOutlined className="text-sm" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-inter font-medium text-on-surface mb-1">
                Title *
              </label>
              <Input
                placeholder="e.g., Modern Kitchen Remodel"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="rounded-lg! h-11!"
              />
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-on-surface mb-1">
                Category
              </label>
              <Select
                placeholder="Select a category"
                value={formData.category || undefined}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                className="w-full! rounded-lg!"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-inter font-medium text-on-surface mb-1">
                Description
              </label>
              <TextArea
                rows={3}
                placeholder="Briefly describe the work done..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-lg!"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={clearSelection}
              disabled={uploading}
              className="flex-1! rounded-lg! h-11! font-inter! border-outline! text-on-surface! hover:border-primary! hover:text-primary!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              className="flex-1! rounded-lg! h-11! bg-secondary! border-secondary! font-inter! font-semibold! hover:bg-secondary/90!"
            >
              {uploading ? "Uploading..." : "Save to Portfolio"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
