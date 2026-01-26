// src/services/calendar-service.js
import { google } from "googleapis";
import { logError, logInfo } from "../utils/logger.js";
import { query } from "../config/db.js";

// Initialize Google Calendar API
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173"
);

// Set credentials if available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
}

/**
 * Generate Google OAuth URL for calendar access
 */
export const getCalendarAuthUrl = (userId) => {
  const scopes = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events"
  ];

  const state = JSON.stringify({ userId, purpose: "calendar_sync" });

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: state,
    prompt: "consent"
  });
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeCodeForTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    logError("Error exchanging code for tokens:", error);
    throw new Error("Failed to authenticate with Google Calendar");
  }
};

/**
 * Store calendar tokens for a user
 */
export const storeCalendarTokens = async (userId, tokens) => {
  try {
    await query(
      `UPDATE users
       SET google_access_token = $1,
           google_refresh_token = $2,
           google_token_expiry = $3,
           calendar_sync_enabled = true,
           updated_at = NOW()
       WHERE user_id = $4`,
      [
        tokens.access_token,
        tokens.refresh_token,
        new Date(tokens.expiry_date),
        userId
      ]
    );
    logInfo(`Calendar tokens stored for user ${userId}`);
  } catch (error) {
    logError("Error storing calendar tokens:", error);
    throw new Error("Failed to store calendar tokens");
  }
};

/**
 * Get calendar events for a user within a date range
 */
export const getCalendarEvents = async (userId, startDate, endDate) => {
  try {
    // Get user's tokens
    const { rows } = await query(
      "SELECT google_access_token, google_refresh_token, google_token_expiry FROM users WHERE user_id = $1",
      [userId]
    );

    if (!rows.length || !rows[0].google_access_token) {
      return []; // No calendar sync enabled
    }

    const userTokens = rows[0];

    // Set up OAuth client with user's tokens
    const userOAuthClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173"
    );

    userOAuthClient.setCredentials({
      access_token: userTokens.google_access_token,
      refresh_token: userTokens.google_refresh_token,
      expiry_date: userTokens.google_token_expiry?.getTime()
    });

    // Refresh token if needed
    if (userOAuthClient.isTokenExpiring()) {
      await userOAuthClient.refreshAccessToken();
      const newTokens = userOAuthClient.credentials;

      // Update stored tokens
      await query(
        `UPDATE users
         SET google_access_token = $1,
             google_token_expiry = $2,
             updated_at = NOW()
         WHERE user_id = $3`,
        [newTokens.access_token, new Date(newTokens.expiry_date), userId]
      );
    }

    const calendar = google.calendar({ version: "v3", auth: userOAuthClient });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    return response.data.items || [];
  } catch (error) {
    logError("Error fetching calendar events:", error);
    // Return empty array instead of throwing to avoid breaking booking flow
    return [];
  }
};

/**
 * Check if a time slot conflicts with calendar events
 */
export const checkCalendarConflicts = async (userId, slotStart, slotEnd) => {
  try {
    const startDate = new Date(slotStart);
    const endDate = new Date(slotEnd);

    // Add buffer time (e.g., 1 hour before and after)
    const bufferStart = new Date(startDate.getTime() - 60 * 60 * 1000);
    const bufferEnd = new Date(endDate.getTime() + 60 * 60 * 1000);

    const events = await getCalendarEvents(userId, bufferStart, bufferEnd);

    // Check for conflicts
    for (const event of events) {
      if (event.status === "confirmed") {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);

        // Check if slot overlaps with event
        if (slotStart < eventEnd && slotEnd > eventStart) {
          return {
            conflict: true,
            event: {
              title: event.summary,
              start: eventStart,
              end: eventEnd
            }
          };
        }
      }
    }

    return { conflict: false };
  } catch (error) {
    logError("Error checking calendar conflicts:", error);
    // Return no conflict to avoid blocking bookings
    return { conflict: false };
  }
};

/**
 * Disable calendar sync for a user
 */
export const disableCalendarSync = async (userId) => {
  try {
    await query(
      `UPDATE users
       SET google_access_token = NULL,
           google_refresh_token = NULL,
           google_token_expiry = NULL,
           calendar_sync_enabled = false,
           updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );
    logInfo(`Calendar sync disabled for user ${userId}`);
  } catch (error) {
    logError("Error disabling calendar sync:", error);
    throw new Error("Failed to disable calendar sync");
  }
};

/**
 * Get calendar sync status for a user
 */
export const getCalendarSyncStatus = async (userId) => {
  try {
    const { rows } = await query(
      "SELECT calendar_sync_enabled FROM users WHERE user_id = $1",
      [userId]
    );

    return {
      enabled: rows.length > 0 ? rows[0].calendar_sync_enabled || false : false
    };
  } catch (error) {
    logError("Error getting calendar sync status:", error);
    return { enabled: false };
  }
};
