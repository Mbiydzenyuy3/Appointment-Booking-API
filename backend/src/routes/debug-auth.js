import express from "express";
import * as AuthController from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/google-auth-debug", async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Google token is required."
      });
    }

    try {
      const { OAuth2Client } = await import("google-auth-library");

      const googleClient = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
      );

      const ticket = await googleClient.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      return res.status(200).json({
        success: true,
        message: "Debug: Google OAuth verification successful",
        debug: {
          googleClientCreated: true,
          tokenVerified: true,
          payload: {
            email: payload.email,
            name: payload.name,
            googleId: payload.sub,
            email_verified: payload.email_verified
          }
        }
      });
    } catch (googleError) {
      return res.status(500).json({
        success: false,
        message: "Google OAuth verification failed",
        error: googleError.message,
        stack: googleError.stack
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Debug endpoint error",
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
