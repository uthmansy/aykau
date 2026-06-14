"use client";

import { useState } from "react";
import { Upload, App, Progress } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

interface Props {
  contractId?: string;
  disputeId?: string;
  onUploadComplete: (url: string, fileType: "photo" | "document") => void;
  maxFiles?: number;
}

export default function EvidenceUploader({
  contractId,
  disputeId,
  onUploadComplete,
  maxFiles = 5,
}: Props) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const folder = disputeId
        ? `disputes/${disputeId}`
        : `contracts/${contractId}`;
      const filePath = `${folder}/${user.id}/${Date.now()}-${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("dispute-evidence")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("dispute-evidence").getPublicUrl(filePath);
      const fileType = file.type.startsWith("image/") ? "photo" : "document";

      onUploadComplete(publicUrl, fileType);
      message.success(`${file.name} uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      message.error(`Failed to upload ${file.name}: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isDoc =
      file.type === "application/pdf" ||
      file.type.includes("document") ||
      file.type.includes("word") ||
      file.type.includes("sheet");

    if (!isImage && !isDoc) {
      message.error("You can only upload images or PDF/Word documents!");
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }

    handleUpload(file);
    return false;
  };

  return (
    <div className="w-full">
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        multiple
        maxCount={maxFiles}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
      >
        {/* ✅ Redesigned Drop Zone: 16px radius, dashed outline, Navy hover tint */}
        <div className="border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer bg-surface-container-lowest">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UploadOutlined className="text-primary text-xl" />
          </div>
          <div className="text-center">
            <p className="font-inter text-[14px] font-medium text-on-surface mb-1">
              Click to upload photos or documents
            </p>
            <p className="font-inter text-[12px] text-on-surface-variant">
              Max {maxFiles} files, 10MB each
            </p>
          </div>
        </div>
      </Upload>

      {uploading && (
        <Progress
          percent={50}
          status="active"
          className="mt-4"
          showInfo={false}
          // ThemeProvider automatically applies the Navy primary color to Progress bars
        />
      )}
    </div>
  );
}
