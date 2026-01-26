// src/routes/calendar.js
import express from "express";
import * as CalendarController from "../controllers/calendar-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = express.Router();

/**
 * @swagger
 * /calendar/auth-url:
 *   get:
 *     summary: Get Google Calendar authorization URL
 *     security:
 *       - bearerAuth: []
 */
router.get("/auth-url", authMiddleware, CalendarController.getAuthUrl);

/**
 * @swagger
 * /calendar/callback:
 *   get:
 *     summary: Handle Google OAuth callback for calendar
 */
router.get("/callback", CalendarController.handleCallback);

/**
 * @swagger
 * /calendar/status:
 *   get:
 *     summary: Get calendar sync status
 *     security:
 *       - bearerAuth: []
 */
router.get("/status", authMiddleware, CalendarController.getSyncStatus);

/**
 * @swagger
 * /calendar/disable:
 *   post:
 *     summary: Disable calendar sync
 *     security:
 *       - bearerAuth: []
 */
router.post("/disable", authMiddleware, CalendarController.disableSync);

/**
 * @swagger
 * /calendar/test:
 *   get:
 *     summary: Test calendar connection
 *     security:
 *       - bearerAuth: []
 */
router.get("/test", authMiddleware, CalendarController.testConnection);

export default router;
