// src/services/whatsapp-service.js
import { query } from "../config/db.js";
import { logInfo, logError } from "../utils/logger.js";
import axios from "axios";

// WhatsApp Business API configuration
const WHATSAPP_API_URL =
  process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v17.0";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppMessage(to, message) {
  try {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      logError("WhatsApp API not configured");
      return { success: false, error: "WhatsApp API not configured" };
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    logInfo("WhatsApp message sent successfully", {
      to,
      messageId: response.data.messages?.[0]?.id
    });
    return { success: true, messageId: response.data.messages?.[0]?.id };
  } catch (error) {
    logError("Failed to send WhatsApp message", error);
    return { success: false, error: error.message };
  }
}

export async function broadcastAvailableSlots(providerId, slots) {
  try {
    // Get provider's WhatsApp contacts (this would need to be implemented based on your contact storage)
    const contacts = await getProviderContacts(providerId);

    if (!contacts || contacts.length === 0) {
      logInfo("No contacts found for broadcasting", { providerId });
      return { success: true, sent: 0, total: 0 };
    }

    // Create broadcast record
    const { rows } = await query(
      "INSERT INTO whatsapp_broadcasts (provider_id, message, recipient_count) VALUES ($1, $2, $3) RETURNING broadcast_id",
      [
        providerId,
        `Available slots: ${slots
          .map((s) => `${s.day} ${s.start_time}-${s.end_time}`)
          .join(", ")}`,
        contacts.length
      ]
    );
    const broadcastId = rows[0].broadcast_id;

    let sentCount = 0;
    const message = `Hello! I have new available slots:\n${slots
      .map((s) => `• ${s.day} at ${s.start_time}`)
      .join("\n")}\n\nBook now: ${
      process.env.FRONTEND_URL
    }/book/${await getProviderBookingSlug(providerId)}`;

    // Send to each contact
    for (const contact of contacts) {
      const result = await sendWhatsAppMessage(contact.phone, message);
      if (result.success) {
        sentCount++;
      }
    }

    // Update broadcast record
    await query(
      "UPDATE whatsapp_broadcasts SET sent_count = $1, status = 'completed', sent_at = CURRENT_TIMESTAMP WHERE broadcast_id = $2",
      [sentCount, broadcastId]
    );

    logInfo("Broadcast completed", {
      providerId,
      sent: sentCount,
      total: contacts.length
    });
    return { success: true, sent: sentCount, total: contacts.length };
  } catch (error) {
    logError("Failed to broadcast slots", error);
    return { success: false, error: error.message };
  }
}

export async function sendBookingConfirmation(
  providerId,
  clientPhone,
  appointmentDetails
) {
  try {
    const provider = await getProviderDetails(providerId);
    const message = `Salut! 🎉 Your appointment with ${
      provider.name
    } is confirmed!\n\n📅 Date: ${appointmentDetails.date}\n🕐 Time: ${
      appointmentDetails.time
    }\n📍 Service: ${appointmentDetails.service}\n${
      appointmentDetails.price
        ? `💰 Price: ${appointmentDetails.price} FCFA\n`
        : ""
    }\nWe're excited to serve you! If you need to reschedule, just let us know.\n\nSee you soon! 😊`;

    const result = await sendWhatsAppMessage(clientPhone, message);
    return result;
  } catch (error) {
    logError("Failed to send booking confirmation", error);
    return { success: false, error: error.message };
  }
}

export async function sendProviderNotification(
  providerPhone,
  clientName,
  appointmentDetails
) {
  try {
    const message = `Great news! ${clientName} has booked an appointment with you.\n\n📅 Date: ${
      appointmentDetails.date
    }\n🕐 Time: ${appointmentDetails.time}\n📍 Service: ${
      appointmentDetails.service
    }\n💰 Amount: ${appointmentDetails.price || "TBD"}\n\nTime to shine! 🌟`;

    const result = await sendWhatsAppMessage(providerPhone, message);
    return result;
  } catch (error) {
    logError("Failed to send provider notification", error);
    return { success: false, error: error.message };
  }
}

export async function sendAppointmentReminder(clientPhone, appointmentDetails) {
  try {
    const message = `Reminder: Your appointment is tomorrow!\n\n📅 Date: ${appointmentDetails.date}\n🕐 Time: ${appointmentDetails.time}\n📍 Service: ${appointmentDetails.service}\n\nWe're looking forward to seeing you! 😊`;

    const result = await sendWhatsAppMessage(clientPhone, message);
    return result;
  } catch (error) {
    logError("Failed to send appointment reminder", error);
    return { success: false, error: error.message };
  }
}

// Helper functions
async function getProviderContacts(providerId) {
  try {
    // This would need to be implemented based on how you store client contacts
    // For now, return empty array
    return [];
  } catch (error) {
    logError("Failed to get provider contacts", error);
    return [];
  }
}

async function getProviderBookingSlug(providerId) {
  try {
    const { rows } = await query(
      "SELECT booking_slug FROM providers WHERE provider_id = $1",
      [providerId]
    );
    return rows[0]?.booking_slug || providerId;
  } catch (error) {
    logError("Failed to get provider booking slug", error);
    return providerId;
  }
}

async function getProviderDetails(providerId) {
  try {
    const { rows } = await query(
      "SELECT p.*, u.name FROM providers p JOIN users u ON p.user_id = u.user_id WHERE p.provider_id = $1",
      [providerId]
    );
    return rows[0] || { name: "Provider" };
  } catch (error) {
    logError("Failed to get provider details", error);
    return { name: "Provider" };
  }
}
