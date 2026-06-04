// store/chat.store.ts
import { create } from "zustand";

type ChatState = {
  messagesCache: Record<string, any[]>;
  setMessages: (conversationId: string, messages: any[]) => void;
  prependMessages: (conversationId: string, olderMessages: any[]) => void;
  appendMessage: (conversationId: string, newMessage: any) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: any
  ) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messagesCache: {},
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesCache: { ...state.messagesCache, [conversationId]: messages },
    })),
  prependMessages: (conversationId, olderMessages) =>
    set((state) => {
      const current = state.messagesCache[conversationId] || [];
      return {
        messagesCache: {
          ...state.messagesCache,
          [conversationId]: [...olderMessages, ...current],
        },
      };
    }),
  appendMessage: (conversationId, newMessage) =>
    set((state) => {
      const current = state.messagesCache[conversationId] || [];
      return {
        messagesCache: {
          ...state.messagesCache,
          [conversationId]: [...current, newMessage],
        },
      };
    }),
  updateMessage: (conversationId, messageId, updates) =>
    set((state) => {
      const current = state.messagesCache[conversationId] || [];
      return {
        messagesCache: {
          ...state.messagesCache,
          [conversationId]: current.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
        },
      };
    }),
}));
