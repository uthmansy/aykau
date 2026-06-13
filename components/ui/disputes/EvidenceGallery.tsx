// components/ui/disputes/EvidenceGallery.tsx
"use client";

import { useEffect, useState } from "react";
import { Image, Typography, Empty, Spin, Modal, Divider } from "antd";
import {
  FileImageOutlined,
  FileTextOutlined,
  FileOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";
import EvidenceUploader from "./EvidenceUploader"; // 🟢 Import the uploader

const { Text, Title } = Typography;

interface Evidence {
  id: string;
  evidence_type: string;
  url: string;
  description: string | null;
  created_at: string;
  submitted_by: string;
  metadata?: any;
  submitter?: {
    full_name: string;
  };
}

interface Props {
  disputeId: string;
}

export default function EvidenceGallery({ disputeId }: Props) {
  const userId = useAuthStore((state) => state.user?.id);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    fetchEvidence();
  }, [disputeId]);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dispute_evidence")
        .select(`*, submitter:submitted_by(full_name)`)
        .eq("dispute_id", disputeId)
        .order("created_at", { ascending: false }); // 🟢 Show newest first

      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error("Fetch evidence error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle new upload from the gallery page
  const handleNewEvidence = async (
    url: string,
    fileType: "photo" | "document"
  ) => {
    try {
      const { error } = await supabase.from("dispute_evidence").insert({
        dispute_id: disputeId,
        submitted_by: userId,
        evidence_type: fileType,
        url: url,
        description: "Additional evidence",
      });

      if (error) throw error;

      // Refresh the gallery to show the new item
      fetchEvidence();
    } catch (error) {
      console.error("Error saving evidence record:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  const photos = evidence.filter((e) => e.evidence_type === "photo");
  const documents = evidence.filter((e) => e.evidence_type === "document");
  const snapshots = evidence.filter((e) => e.evidence_type === "chat_snapshot");

  return (
    <div className="space-y-8">
      {/* 🟢 ADD EVIDENCE SECTION (Only show if dispute is not resolved/withdrawn) */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <Title level={5} className="!mb-3 flex items-center gap-2">
          <PlusOutlined className="text-blue-600" /> Add More Evidence
        </Title>
        <Text className="text-gray-600 text-sm block mb-4">
          Upload additional photos or documents to support your case during
          mediation.
        </Text>
        <EvidenceUploader
          disputeId={disputeId}
          onUploadComplete={handleNewEvidence}
          maxFiles={10}
        />
      </div>

      <Divider className="!my-6" />

      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileImageOutlined className="text-blue-500" />
            <Title level={5} className="!mb-0">
              Photos ({photos.length})
            </Title>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden"
                onClick={() => {
                  setPreviewImage(item.url);
                  setPreviewVisible(true);
                }}
              >
                <Image
                  src={item.url}
                  alt={item.description || "Evidence photo"}
                  className="!w-full !h-40 object-cover"
                  preview={false}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <Text className="text-white text-xs font-medium block">
                    {item.submitter?.full_name}
                  </Text>
                  <Text className="text-white/80 text-[10px]">
                    {dayjs(item.created_at).format("MMM D, YYYY")}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileTextOutlined className="text-red-500" />
            <Title level={5} className="!mb-0">
              Documents ({documents.length})
            </Title>
          </div>
          <div className="space-y-2">
            {documents.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              >
                <FileOutlined className="text-red-500 text-xl" />
                <div className="flex-1 min-w-0">
                  <Text strong className="block truncate">
                    {item.description || "Document"}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {item.submitter?.full_name} •{" "}
                    {dayjs(item.created_at).format("MMM D, YYYY")}
                  </Text>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Chat Snapshots */}
      {snapshots.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileTextOutlined className="text-purple-500" />
            <Title level={5} className="!mb-0">
              Chat History Snapshot
            </Title>
          </div>
          {snapshots.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
            >
              <Text className="text-purple-900 text-sm block mb-2">
                {item.description}
              </Text>
              <Text className="text-purple-700 text-xs block mb-3">
                Captured on{" "}
                {dayjs(item.created_at).format("MMM D, YYYY h:mm A")}
              </Text>
              {item.metadata?.messages && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {item.metadata.messages
                    .slice(0, 10)
                    .map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded border border-purple-100 text-sm"
                      >
                        <Text
                          strong
                          className="text-xs text-purple-700 block mb-1"
                        >
                          {msg.sender_id === item.submitted_by
                            ? "You"
                            : "Other Party"}
                        </Text>
                        <Text className="text-gray-800 block">
                          {msg.content}
                        </Text>
                        <Text className="text-gray-400 text-xs block mt-1">
                          {dayjs(msg.created_at).format("MMM D, h:mm A")}
                        </Text>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {evidence.length === 0 && (
        <Empty description="No evidence submitted yet" className="py-12" />
      )}

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img
          alt="Evidence"
          style={{ width: "100%", borderRadius: "8px" }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
}
