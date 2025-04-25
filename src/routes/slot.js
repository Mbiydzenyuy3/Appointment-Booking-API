import express from "express";
import * as SlotController from "../controllers/slot-controller.js"
import { requireProvider } from "../middlewares/role-middleware.js";
import { validate } from "../middlewares/validate-middleware.js"
import { slotSchema } from "../validators/slot-validator.js"

const router = express.Router();
router.post("/", validate(slotSchema), requireProvider, SlotController.create);
router.get("/:providerId", SlotController.list);
export default router;