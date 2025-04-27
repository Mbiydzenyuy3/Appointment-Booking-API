import express from "express";
import authRouter from "./auth.js";
import appointmentRouter from "./appointment.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/appointments", appointmentRouter);

export default router;
