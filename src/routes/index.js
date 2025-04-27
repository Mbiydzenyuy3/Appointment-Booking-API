//src/routes/index.js
import express from "express";
import authRouter from "./auth.js"; //authentication route
import appointmentRouter from "./appointment.js"; //appointment route

const router = express.Router();

//Attached the routes
router.use("/auth", authRouter);
router.use("/appointments", appointmentRouter);

// router.use("/users", usersRouter);
// router.use("/providers", providerRouter);

// Optional: 404 handler if the route doesn't exist
router.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
