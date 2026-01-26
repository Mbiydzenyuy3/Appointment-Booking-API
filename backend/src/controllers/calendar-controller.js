// src/controllers/calendar-controller.js
import * as CalendarService from "../services/calendar-service.js";
import { logError } from "../utils/logger.js";

/**
 * Get calendar authorization URL
 */
export async function getAuthUrl(req, res, next) {
  try {
    const userId = req.user.user_id;
    const authUrl = CalendarService.getCalendarAuthUrl(userId);

    res.status(200).json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    logError("Error generating calendar auth URL:", error);
    next(error);
  }
}

/**
 * Handle Google OAuth callback for calendar
 */
export async function handleCallback(req, res, next) {
  try {
    const { code, state } = req.query;
    const { userId } = JSON.parse(state);

    const tokens = await CalendarService.exchangeCodeForTokens(code);
    await CalendarService.storeCalendarTokens(userId, tokens);

    res.status(200).json({
      success: true,
      message: "Calendar sync enabled successfully!"
    });
  } catch (error) {
    logError("Error handling calendar callback:", error);
    next(error);
  }
}

/**
 * Get calendar sync status
 */
export async function getSyncStatus(req, res, next) {
  try {
    const userId = req.user.user_id;
    const status = await CalendarService.getCalendarSyncStatus(userId);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logError("Error getting calendar sync status:", error);
    next(error);
  }
}

/**
 * Disable calendar sync
 */
export async function disableSync(req, res, next) {
  try {
    const userId = req.user.user_id;
    await CalendarService.disableCalendarSync(userId);

    res.status(200).json({
      success: true,
      message: "Calendar sync disabled successfully."
    });
  } catch (error) {
    logError("Error disabling calendar sync:", error);
    next(error);
  }
}

/**
 * Test calendar connection
 */
export async function testConnection(req, res, next) {
  try {
    const userId = req.user.user_id;

    // Try to fetch events for next 7 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const events = await CalendarService.getCalendarEvents(
      userId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      message: "Calendar connection successful",
      data: {
        eventCount: events.length,
        nextEvent: events[0]
          ? {
              title: events[0].summary,
              start: events[0].start.dateTime || events[0].start.date
            }
          : null
      }
    });
  } catch (error) {
    logError("Error testing calendar connection:", error);
    res.status(200).json({
      success: false,
      message: "Calendar connection failed",
      error: error.message
    });
  }
}
