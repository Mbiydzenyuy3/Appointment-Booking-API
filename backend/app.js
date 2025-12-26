// app.js - Enhanced with AI Scheduling Routes
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import { ErrorHandler } from "./src/middlewares/error-handler-middleware.js";

import { initSocket } from "./src/sockets/socket.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";

import { initializeRedis } from "./src/config/redis.js";
import cacheService from "./src/services/cache-service.js";
import cron from "node-cron";
import * as SlotService from "./src/services/slot-service.js";
// Route Imports
import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js"; // Using real auth for production
import appointmentRouter from "./src/routes/appointment.js";
import slotRouter from "./src/routes/slot.js";
import providerRouter from "./src/routes/provider.js";
import serviceRoutes from "./src/routes/service.js";
import aiSchedulerRouter from "./src/routes/ai-scheduler.js";
import performanceRouter from "./src/routes/performance.js";
import debugAuthRouter from "./src/routes/debug-auth.js";

const app = express();

// Setup __dirname (since ES modules don't have it by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: [
      "https://appointment-booking-api-1-7zro.onrender.com",
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
    credentials: true // if you use cookies or auth headers
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/debug-auth", debugAuthRouter);
app.use("/appointments", appointmentRouter);
app.use("/slots", slotRouter);
app.use("/providers", providerRouter);
app.use("/services", serviceRoutes);
app.use("/api/ai-scheduler", aiSchedulerRouter);
app.use("/api/performance", performanceRouter);

// Schedule daily slot advancement at 00:01 UTC
cron.schedule("1 0 * * *", async () => {
  try {
    await SlotService.advanceSlotsService();
    console.log("Slots advanced successfully");
  } catch (err) {
    console.error("Error advancing slots:", err);
  }
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Add error handler middleware
app.use(ErrorHandler);

export { app, initSocket };
