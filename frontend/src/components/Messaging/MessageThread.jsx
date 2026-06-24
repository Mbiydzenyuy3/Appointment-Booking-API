import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function MessageThread({ conversation, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const providerId = conversation.provider_id;
  const isProvider = user?.user_type === "provider";
  const clientUserId = isProvider ? conversation.other_user_id : undefined;

  useEffect(() => {
    const url = clientUserId
      ? `/messages/conversations/${providerId}?client_user_id=${clientUserId}`
      : `/messages/conversations/${providerId}`;

    api.get(url)
      .then((res) => setMessages(res.data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [providerId, clientUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const body = { provider_id: providerId, content: newMessage.trim() };
      if (clientUserId) body.client_user_id = clientUserId;
      const res = await api.post("/messages", body);
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage("");
    } catch {
      // message stays in input so user can retry
    } finally {
      setSending(false);
    }
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
                  <p className={`text-xs mt-1 ${isMine ? "text-green-200" : "text-gray-400"}`}>
                    {formatTime(msg.created_at)}
                  </p>
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
