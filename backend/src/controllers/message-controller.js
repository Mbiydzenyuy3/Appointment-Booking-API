import * as MessageModel from "../models/message-model.js";
import ProviderModel from "../models/provider-model.js";
import { logError } from "../utils/logger.js";
import { getSocket } from "../sockets/socket.js";

export async function sendMessage(req, res, next) {
  try {
    const senderId = req.user.user_id;
    const { provider_id, content, client_user_id } = req.body;

    if (!provider_id || !content?.trim()) {
      return res.status(400).json({ success: false, message: "provider_id and content are required." });
    }
    if (content.trim().length > 2000) {
      return res.status(400).json({ success: false, message: "Message cannot exceed 2000 characters." });
    }

    const provider = await ProviderModel.findById(provider_id);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }

    let receiverId;
    if (req.user.user_type === "provider" && req.user.provider_id === provider_id) {
      // Provider replying to a client — client_user_id must be provided
      if (!client_user_id) {
        return res.status(400).json({ success: false, message: "client_user_id is required for provider replies." });
      }
      receiverId = client_user_id;
    } else {
      // Client messaging the provider
      receiverId = provider.user_id;
    }

    const message = await MessageModel.sendMessage({
      providerId: provider_id,
      senderId,
      receiverId,
      content: content.trim()
    });

    // Real-time push to receiver (best-effort — not critical if socket unavailable)
    try {
      const io = getSocket();
      io.to(`user:${receiverId}`).emit("new_message", message);
    } catch { /* socket not initialized or receiver offline */ }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    logError("Send message failed", err);
    next(err);
  }
}

export async function getConversations(req, res, next) {
  try {
    const userId = req.user.user_id;
    const conversations = req.user.user_type === "provider"
      ? await MessageModel.getProviderConversations(userId)
      : await MessageModel.getClientConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (err) {
    logError("Get conversations failed", err);
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { providerId } = req.params;

    const provider = await ProviderModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }

    const isProviderOwner = req.user.user_type === "provider" && req.user.provider_id === providerId;
    // Provider needs to specify which client's thread to view; clients use their own ID
    const clientUserId = isProviderOwner ? req.query.client_user_id : userId;

    if (!clientUserId) {
      return res.status(400).json({ success: false, message: "client_user_id query param required for providers." });
    }

    const messages = await MessageModel.getConversation(providerId, clientUserId);
    res.json({ success: true, data: messages });
  } catch (err) {
    logError("Get conversation failed", err);
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const updated = await MessageModel.markAsRead(req.params.messageId, req.user.user_id);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Message not found or already read." });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    logError("Mark message read failed", err);
    next(err);
  }
}
