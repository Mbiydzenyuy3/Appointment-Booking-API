import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function ConversationList({ onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/messages/conversations")
      .then((res) => setConversations(res.data.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-8 text-center text-gray-500 text-sm">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="py-12 text-center">
        <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const key = conv.provider_id + (conv.other_user_id || "");
        const name = conv.provider_name || conv.other_user_name || "Unknown";
        const unread = Number(conv.unread_count || 0);
        return (
          <button
            key={key}
            onClick={() => onSelect(conv)}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 font-semibold text-sm">
                {name[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
                {unread > 0 && (
                  <span className="bg-green-600 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
                    {unread}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs truncate mt-0.5">{conv.last_message}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
