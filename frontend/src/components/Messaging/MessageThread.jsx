import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api.js";
import { getSocket } from "../../services/socket.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

function Ticks({ status }) {
  if (status === "sending") {
    return <span className="text-green-200 text-xs ml-1 leading-none">⏱</span>;
  }
  if (status === "read") {
    return (
      <span className="ml-1 leading-none inline-flex gap-px">
        <svg className="w-3 h-3 text-blue-300" viewBox="0 0 12 8" fill="none">
          <path d="M1 4L4 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className="w-3 h-3 text-blue-300 -ml-1.5" viewBox="0 0 12 8" fill="none">
          <path d="M1 4L4 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="ml-1 leading-none inline-flex gap-px">
        <svg className="w-3 h-3 text-green-200" viewBox="0 0 12 8" fill="none">
          <path d="M1 4L4 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className="w-3 h-3 text-green-200 -ml-1.5" viewBox="0 0 12 8" fill="none">
          <path d="M1 4L4 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  // "sent"
  return (
    <span className="ml-1 leading-none">
      <svg className="w-3 h-3 text-green-200 inline" viewBox="0 0 12 8" fill="none">
        <path d="M1 4L4 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

export default function MessageThread({ conversation, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deliveredIds, setDeliveredIds] = useState(new Set());
  const bottomRef = useRef(null);

  const providerId = conversation.provider_id;
  const isProvider = user?.user_type === "provider";
  const clientUserId = isProvider ? conversation.other_user_id : undefined;

  // Load conversation thread
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    const url = clientUserId
      ? `/messages/conversations/${providerId}?client_user_id=${clientUserId}`
      : `/messages/conversations/${providerId}`;

    api.get(url)
      .then((res) => setMessages(res.data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [providerId, clientUserId]);

  // Socket: real-time incoming messages + delivery/read receipts
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.provider_id !== providerId) return;
      const participantId = clientUserId || user?.user_id;
      if (msg.sender_id !== participantId && msg.receiver_id !== participantId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.message_id === msg.message_id)) return prev;
        return [...prev, msg];
      });
    };

    const handleDelivered = ({ message_id }) => {
      setDeliveredIds((prev) => new Set([...prev, message_id]));
    };

    const handleMessagesRead = ({ message_ids }) => {
      setMessages((prev) =>
        prev.map((m) => (message_ids.includes(m.message_id) ? { ...m, is_read: true } : m))
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_delivered", handleDelivered);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_delivered", handleDelivered);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [providerId, clientUserId, user?.user_id]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      message_id: tempId,
      sender_id: user.user_id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      _sending: true
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");
    setSending(true);

    try {
      const body = { provider_id: providerId, content };
      if (clientUserId) body.client_user_id = clientUserId;
      const res = await api.post("/messages", body);
      setMessages((prev) =>
        prev.map((m) => (m.message_id === tempId ? res.data.data : m))
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.message_id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const getTickStatus = (msg) => {
    if (msg._sending) return "sending";
    if (msg.is_read) return "read";
    if (deliveredIds.has(msg.message_id)) return "delivered";
    return "sent";
  };

  const otherName = conversation.provider_name || conversation.other_user_name || "User";

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 340 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <span className="text-green-700 font-semibold text-xs">
            {otherName[0].toUpperCase()}
          </span>
        </div>
        <p className="font-semibold text-gray-900 text-sm">{otherName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 text-sm">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.user_id;
            const tickStatus = isMine ? getTickStatus(msg) : null;
            return (
              <div key={msg.message_id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMine
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMine ? "text-green-200" : "text-gray-400"}`}>
                    <span className="text-xs">{formatTime(msg.created_at)}</span>
                    {isMine && <Ticks status={tickStatus} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0"
      >
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Type a message..."
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
