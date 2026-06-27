import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import * as MessageController from "../controllers/message-controller.js";

const router = express.Router();

router.post("/", authMiddleware, MessageController.sendMessage);
router.get("/conversations", authMiddleware, MessageController.getConversations);
router.get("/conversations/:providerId", authMiddleware, MessageController.getConversation);
router.put("/:messageId/read", authMiddleware, MessageController.markRead);

export default router;
