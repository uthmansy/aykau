"use client";

import { useState, useEffect, useRef } from "react";
import { Input, Button, App, Upload } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  CommentOutlined,
  PaperClipOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/auth.store";

interface Attachment {
  file: File;
  preview?: string;
  type: "image" | "pdf" | "document";
  uploading: boolean;
  progress: number;
}
interface Props {
  conversationId: string;
  currentUserId: string;
  replyingTo: any | null;
  onCancelReply: () => void;
}

export default function MessageInput({
  conversationId,
  currentUserId,
  replyingTo,
  onCancelReply,
}: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { message } = App.useApp();
  const inputRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyingTo && inputRef.current)
      setTimeout(() => inputRef.current.focus(), 50);
  }, [replyingTo]);
  useEffect(() => {
    return () => {
      attachments.forEach((att) => {
        if (att.preview) URL.revokeObjectURL(att.preview);
      });
    };
  }, [attachments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + attachments.length > 5)
      return message.warning("You can attach up to 5 files at a time");
    const newAttachments: Attachment[] = files.map((file) => {
      let type: "image" | "pdf" | "document" = "document";
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        type = "image";
        preview = URL.createObjectURL(file);
      } else if (file.type === "application/pdf") type = "pdf";
      return { file, preview, type, uploading: false, progress: 0 };
    });
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const att = prev[index];
      if (att.preview) URL.revokeObjectURL(att.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFile = async (attachment: Attachment): Promise<string> => {
    const fileExt = attachment.file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${conversationId}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("message-attachments")
      .upload(filePath, attachment.file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) throw uploadError;
    const { data: urlData } = await supabase.storage
      .from("message-attachments")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);
    if (!urlData?.signedUrl) throw new Error("Failed to get file URL");
    return urlData.signedUrl;
  };

  const handleSend = async () => {
    if (!text.trim() && attachments.length === 0 && !replyingTo) return;
    setSending(true);
    try {
      const uploadedAttachments = await Promise.all(
        attachments.map(async (att) => {
          const url = await uploadFile(att);
          return {
            url,
            type: att.type,
            name: att.file.name,
            size: att.file.size,
          };
        })
      );
      const payload: any = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content:
          text.trim() ||
          (uploadedAttachments.length > 0
            ? "Sent an attachment"
            : "Replied to a message"),
        attachments:
          uploadedAttachments.length > 0 ? uploadedAttachments : null,
      };
      if (replyingTo) payload.quoted_message_id = replyingTo.id;
      const { error } = await supabase.from("messages").insert(payload);
      if (error) throw error;
      setText("");
      setAttachments([]);
      onCancelReply();
      message.success("Message sent!");
    } catch (error: any) {
      message.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex-shrink-0">
      <div className="relative">
        {replyingTo && (
          <div className="mb-2 p-2.5 bg-primary/5 rounded-lg border-l-4 border-primary flex items-center gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <CommentOutlined className="text-primary rotate-180 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-inter text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                Replying to{" "}
                {replyingTo.sender_id === currentUserId ? "yourself" : "them"}
              </p>
              <p className="font-inter text-[12px] text-on-surface truncate leading-snug">
                {replyingTo.content || "📎 Attachment"}
              </p>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1.5 hover:bg-primary/10 rounded-full transition-colors text-on-surface-variant hover:text-primary flex-shrink-0"
            >
              <CloseOutlined className="text-[10px]" />
            </button>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group">
                {att.type === "image" && att.preview ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/20">
                    <img
                      src={att.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="p-1 bg-surface-container-lowest rounded-full text-on-surface-variant hover:bg-surface-container"
                      >
                        <CloseOutlined className="text-xs" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-20 h-16 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col items-center justify-center p-1">
                    {att.type === "pdf" ? (
                      <FilePdfOutlined className="text-error text-xl mb-1" />
                    ) : (
                      <FileOutlined className="text-on-surface-variant text-xl mb-1" />
                    )}
                    <span className="font-inter text-[9px] text-on-surface-variant truncate w-full text-center">
                      {att.file.name.slice(0, 10)}...
                    </span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-surface-container-lowest rounded-full border border-outline-variant/30 text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CloseOutlined className="text-[8px]" />
                    </button>
                  </div>
                )}
                {att.uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <LoadingOutlined className="text-on-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            icon={<PaperClipOutlined className="text-on-surface-variant" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || attachments.length >= 5}
            className="!rounded-full! !w-10! !h-10! !flex! !items-center! !justify-center! !border-outline-variant/30! hover:!border-primary! !bg-surface-container-lowest! hover:!bg-surface-container!"
            title="Attach files"
          />
          <Input.TextArea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              replyingTo ? "Type your reply..." : "Type a message..."
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="!rounded-2xl! !resize-none! !bg-surface-container! focus:!bg-surface-container-lowest! !border-none! focus:!ring-1! focus:!ring-primary/30! transition-all! flex-1! font-inter! text-[14px]!"
            disabled={sending}
          />
          <Button
            type="primary"
            icon={sending ? <LoadingOutlined /> : <SendOutlined />}
            onClick={handleSend}
            loading={sending}
            disabled={(!text.trim() && attachments.length === 0) || sending}
            className="!rounded-full! !w-10! !h-10! !flex! !items-center! !justify-center! !bg-secondary! hover:!bg-secondary/90! !border-0! mb-0.5!"
          />
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-outline font-inter">
          <span>Supports: Images, PDF, Docs</span>
          <span>•</span>
          <span>Max 10MB per file</span>
          <span>•</span>
          <span>Max 5 files</span>
        </div>
      </div>
    </div>
  );
}
