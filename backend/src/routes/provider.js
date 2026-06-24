// src/routes/provider-routes.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireProvider } from "../middlewares/role-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { providerSchema } from "../validators/provider-validator.js";
import { addGalleryItem, deleteGalleryItem, getProviderGallery } from "../controllers/gallery-controller.js";

const router = express.Router();

/* =========================
   PUBLIC ROUTES (NO AUTH)
========================= */

router.get("/", ProviderController.getAllProviders);

router.get("/slug/:bookingSlug", ProviderController.getProviderProfile);

router.get("/profile/:bookingSlug", ProviderController.getProviderProfile);

router.get("/reviews/:providerId", ProviderController.getReviews);

/* =========================
   AUTHENTICATED ROUTES
========================= */

// Create provider profile (user is authenticated but NOT provider yet)
router.post(
  "/create",
  authMiddleware,
  validate(providerSchema),
  ProviderController.createProvider
);

/* =========================
   PROVIDER-ONLY ROUTES
========================= */

router.get(
  "/me",
  authMiddleware,
  requireProvider,
  ProviderController.getCurrentProvider
);

router.put(
  "/me",
  authMiddleware,
  requireProvider,
  validate(providerSchema),
  ProviderController.updateProvider
);

router.get(
  "/referral-code",
  authMiddleware,
  requireProvider,
  ProviderController.getReferralCode
);

router.post(
  "/use-referral",
  authMiddleware,
  requireProvider,
  ProviderController.useReferralCode
);

router.post(
  "/log-activity",
  authMiddleware,
  requireProvider,
  ProviderController.logActivity
);

router.post(
  "/update-credibility",
  authMiddleware,
  requireProvider,
  ProviderController.updateCredibilityMetrics
);

/* =========================
   REVIEWS (AUTH REQUIRED)
========================= */

router.post("/reviews", authMiddleware, ProviderController.addReview);

router.put(
  "/reviews/:review_id",
  authMiddleware,
  ProviderController.updateReview
);

router.delete(
  "/reviews/:review_id",
  authMiddleware,
  ProviderController.deleteReview
);

router.get("/:providerId/booking-link", ProviderController.getBookingLink);

/* =========================
   GALLERY ROUTES
========================= */

router.post("/me/gallery", authMiddleware, requireProvider, addGalleryItem);
router.delete("/me/gallery/:galleryId", authMiddleware, requireProvider, deleteGalleryItem);
router.get("/:providerId/gallery", getProviderGallery);

export default router;
