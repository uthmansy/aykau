// components/ui/disputes/EvidenceUploader.tsx
"use client";

import { useState } from "react";
import { Upload, Button, App, Typography, Progress } from "antd";
import {
  UploadOutlined,
  FileImageOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

const { Text } = Typography;

interface Props {
  contractId?: string; // Optional now, since we might use it on the dispute page directly
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

      // 🟢 Sanitize filename to prevent path issues with spaces/special chars
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const folder = disputeId
        ? `disputes/${disputeId}`
        : `contracts/${contractId}`;
      const filePath = `${folder}/${user.id}/${Date.now()}-${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("dispute-evidence")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(uploadError.message);
      }

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
    return false; // Prevent default Ant Design upload
  };

  return (
    <div>
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        multiple
        maxCount={maxFiles}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
      >
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          block
          size="large"
          className="!border-dashed !border-gray-300 !h-20 hover:!border-blue-400 hover:!text-blue-600 transition-colors"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-2">
              <FileImageOutlined className="text-gray-400" />
              <FileTextOutlined className="text-gray-400" />
            </div>
            <Text className="text-gray-600">
              Click to upload photos or documents
            </Text>
            <Text className="text-gray-400 text-xs">
              Max {maxFiles} files, 10MB each
            </Text>
          </div>
        </Button>
      </Upload>
      {uploading && (
        <Progress
          percent={50}
          status="active"
          className="mt-3"
          showInfo={false}
        />
      )}
    </div>
  );
}
