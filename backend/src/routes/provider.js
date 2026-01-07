// src/routes/provider-routes.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireProvider } from "../middlewares/role-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { providerSchema } from "../validators/provider-validator.js"; // Optional if you want request validation

const router = express.Router();

/**
 * @swagger
 * /providers/create:
 *   post:
 *     summary: Create a provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       201:
 *         description: Provider profile created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/create",
  authMiddleware,
  validate(providerSchema), // Optional: add this if you want to validate bio/rating
  ProviderController.createProvider
);

/**
 * @swagger
 * /providers/update:
 *   put:
 *     summary: Update the current provider's profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (only providers)
 */

router.put(
  "/update",
  authMiddleware,
  requireProvider,
  validate(providerSchema),
  ProviderController.updateProvider
);

/**
 * @swagger
 * /providers/me:
 *   get:
 *     summary: Get current provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider profile
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only providers allowed
 */

router.get(
  "/me",
  authMiddleware,
  requireProvider,
  ProviderController.getCurrentProvider
);

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: List all providers (public)
 *     tags: [Providers]
 *     responses:
 *       200:
 *         description: Array of provider profiles
 */

router.get("/", ProviderController.getAllProviders);

/**
 * @swagger
 * /providers/top:
 *   get:
 *     summary: Get top-rated providers
 *     tags: [Providers]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: Array of top providers
 */
router.get("/top", ProviderController.getTopProvidersController);

/**
 * @swagger
 * /providers/{providerId}/booking-link:
 *   get:
 *     summary: Get personal booking link for a provider
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personal booking link
 */
router.get("/:providerId/booking-link", ProviderController.getBookingLink);

/**
 * @swagger
 * /providers/slug/{bookingSlug}:
 *   get:
 *     summary: Get provider by booking slug
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: bookingSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider data
 */
router.get("/slug/:bookingSlug", ProviderController.getProviderBySlug);

/**
 * @swagger
 * /providers/profile/{bookingSlug}:
 *   get:
 *     summary: Get detailed provider profile with services (public)
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: bookingSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed provider profile
 */
router.get("/profile/:bookingSlug", ProviderController.getProviderProfile);

/**
 * @swagger
 * /providers/referral-code:
 *   get:
 *     summary: Get current provider's referral code
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral code data
 */
router.get(
  "/referral-code",
  authMiddleware,
  requireProvider,
  ProviderController.getReferralCode
);

/**
 * @swagger
 * /providers/use-referral:
 *   post:
 *     summary: Use a referral code
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referral_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Referral applied successfully
 */
router.post(
  "/use-referral",
  authMiddleware,
  requireProvider,
  ProviderController.useReferralCode
);

/**
 * @swagger
 * /providers/log-activity:
 *   post:
 *     summary: Log provider activity
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity_type:
 *                 type: string
 *               activity_data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Activity logged
 */
router.post(
  "/log-activity",
  authMiddleware,
  requireProvider,
  ProviderController.logProviderActivity
);

/**
 * @swagger
 * /providers/update-credibility:
 *   post:
 *     summary: Update provider credibility metrics
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total_bookings:
 *                 type: integer
 *               completed_bookings:
 *                 type: integer
 *               cancellation_rate:
 *                 type: number
 *               average_rating:
 *                 type: number
 *               response_time_avg:
 *                 type: integer
 *               profile_views:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Credibility metrics updated
 */
router.post(
  "/update-credibility",
  authMiddleware,
  requireProvider,
  ProviderController.updateCredibilityMetrics
);

/**
 * @swagger
 * /providers/reviews:
 *   post:
 *     summary: Add a review for a provider
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider_id:
 *                 type: integer
 *               rating:
 *                 type: number
 *               review_text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 */
router.post("/reviews", authMiddleware, ProviderController.addReview);

/**
 * @swagger
 * /providers/reviews/{providerId}:
 *   get:
 *     summary: Get reviews for a provider
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/reviews/:providerId", ProviderController.getReviews);

/**
 * @swagger
 * /providers/reviews/{review_id}:
 *   put:
 *     summary: Update a review
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               review_text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 */
router.put(
  "/reviews/:review_id",
  authMiddleware,
  ProviderController.updateReview
);

/**
 * @swagger
 * /providers/reviews/{review_id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete(
  "/reviews/:review_id",
  authMiddleware,
  ProviderController.deleteReview
);

export default router;
