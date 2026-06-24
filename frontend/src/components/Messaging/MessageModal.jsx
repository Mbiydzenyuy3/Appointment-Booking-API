import React, { useState } from "react";
import api from "../../services/api.js";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

export default function MessageModal({ providerId, providerName, isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await api.post("/messages", { provider_id: providerId, content: content.trim() });
      toast.success("Message sent!");
      setContent("");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Message {providerName}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask about pricing, location, availability, or anything else..."
            rows={4}
            maxLength={2000}
            autoFocus
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{content.length}/2000</span>
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
