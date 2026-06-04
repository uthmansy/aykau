// components/messages/MessageInput.tsx
"use client";

import { useState } from "react";
import { Input, Button, App } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { supabase } from "@/services/supabase/client";

interface Props {
  conversationId: string;
  currentUserId: string;
}

export default function MessageInput({ conversationId, currentUserId }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { message } = App.useApp();

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text.trim(),
    });

    if (error) {
      message.error("Failed to send message");
    } else {
      setText(""); // Clear input on success
    }
    setSending(false);
  };

  return (
    <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
      <div className="flex items-end gap-3">
        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={(e) => {
            // Send on Enter, but allow Shift+Enter for new lines
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="!rounded-2xl !resize-none !bg-gray-50 focus:!bg-white"
          disabled={sending}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!text.trim()}
          className="!rounded-full !w-10 !h-10 !flex items-center !justify-center !bg-gray-900 hover:!bg-gray-800"
        />
      </div>
    </div>
  );
}
