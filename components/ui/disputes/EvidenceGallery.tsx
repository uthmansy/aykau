"use client";

import { useEffect, useState } from "react";
import { Image, Modal, Empty, Spin } from "antd";
import {
  FileImageOutlined,
  FileTextOutlined,
  FileOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";
import EvidenceUploader from "./EvidenceUploader";

interface Evidence {
  id: string;
  evidence_type: string;
  url: string;
  description: string | null;
  created_at: string;
  submitted_by: string;
  metadata?: any;
  submitter?: { full_name: string };
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
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      fetchEvidence();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    );

  const photos = evidence.filter((e) => e.evidence_type === "photo");
  const documents = evidence.filter((e) => e.evidence_type === "document");
  const snapshots = evidence.filter((e) => e.evidence_type === "chat_snapshot");

  return (
    <div className="space-y-8">
      {/* Add Evidence Section */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
        <h3 className="font-manrope text-[20px] font-semibold text-primary mb-2 flex items-center gap-2">
          <PlusOutlined className="text-primary" /> Add More Evidence
        </h3>
        <p className="font-inter text-[14px] text-on-surface-variant mb-5">
          Upload additional photos or documents to support your case during
          mediation.
        </p>
        <EvidenceUploader
          disputeId={disputeId}
          onUploadComplete={handleNewEvidence}
          maxFiles={10}
        />
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-4">
            <FileImageOutlined className="text-primary" /> Photos (
            {photos.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest"
                onClick={() => {
                  setPreviewImage(item.url);
                  setPreviewVisible(true);
                }}
              >
                <Image
                  src={item.url}
                  alt={item.description || "Evidence photo"}
                  className="!w-full !h-48 object-cover"
                  preview={false}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="font-inter text-[14px] font-medium text-white block">
                    {item.submitter?.full_name}
                  </p>
                  <p className="font-inter text-[12px] text-white/80">
                    {dayjs(item.created_at).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div>
          <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-4">
            <FileTextOutlined className="text-error" /> Documents (
            {documents.length})
          </h4>
          <div className="space-y-3">
            {documents.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/20 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center flex-none">
                  <FileOutlined className="text-error text-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-[14px] font-medium text-on-surface truncate block">
                    {item.description || "Document"}
                  </p>
                  <p className="font-inter text-[12px] text-on-surface-variant mt-0.5">
                    {item.submitter?.full_name} •{" "}
                    {dayjs(item.created_at).format("MMM D, YYYY")}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-surface-container group-hover:bg-surface-container-high transition-colors">
                  <svg
                    className="w-4 h-4 text-on-surface-variant"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Chat Snapshots */}
      {snapshots.length > 0 && (
        <div>
          <h4 className="font-inter text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-4">
            <FileTextOutlined className="text-tertiary" /> Chat History Snapshot
          </h4>
          <div className="space-y-4">
            {snapshots.map((item) => (
              <div
                key={item.id}
                className="bg-tertiary/5 border border-tertiary/10 rounded-2xl p-5"
              >
                <p className="font-inter text-[14px] font-medium text-tertiary block mb-1">
                  {item.description}
                </p>
                <p className="font-inter text-[12px] text-on-surface-variant block mb-4">
                  Captured on{" "}
                  {dayjs(item.created_at).format("MMM D, YYYY h:mm A")}
                </p>
                {item.metadata?.messages && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {item.metadata.messages
                      .slice(0, 10)
                      .map((msg: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20"
                        >
                          <p className="font-inter text-[12px] font-semibold text-tertiary block mb-1">
                            {msg.sender_id === item.submitted_by
                              ? "You"
                              : "Other Party"}
                          </p>
                          <p className="font-inter text-[14px] text-on-surface block">
                            {msg.content}
                          </p>
                          <p className="font-inter text-[11px] text-outline block mt-1.5">
                            {dayjs(msg.created_at).format("MMM D, h:mm A")}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {evidence.length === 0 && (
        <div className="py-12">
          <Empty
            description={
              <span className="font-inter text-on-surface-variant">
                No evidence submitted yet
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

      {/* Image Preview Modal */}
      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
        styles={{
          body: {
            padding: "16px",
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-lowest)",
          },
        }}
      >
        <img
          alt="Evidence"
          style={{ width: "100%", borderRadius: "12px" }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
}
