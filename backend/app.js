// app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import swaggerUi from "swagger-ui-express";
import cron from "node-cron";

import { ErrorHandler } from "./src/middlewares/error-handler-middleware.js";
import swaggerSpec from "./swaggerConfig.js";
import performanceMonitor from "./src/services/performance-monitor.js";
import * as SlotService from "./src/services/slot-service.js";

// Routes
import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js";
import appointmentRouter from "./src/routes/appointment.js";
import slotRouter from "./src/routes/slot.js";
import providerRouter from "./src/routes/provider.js";
import serviceRoutes from "./src/routes/service.js";
import calendarRouter from "./src/routes/calendar.js";
import aiSchedulerRouter from "./src/routes/ai-scheduler.js";
import performanceRouter from "./src/routes/performance.js";
import debugAuthRouter from "./src/routes/debug-auth.js";

const app = express();

// dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    performanceMonitor.recordRequest(Date.now() - start, res.statusCode >= 400);
  });
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/debug-auth", debugAuthRouter);
app.use("/appointments", appointmentRouter);
app.use("/slots", slotRouter);
app.use("/providers", providerRouter);
app.use("/services", serviceRoutes);
app.use("/calendar", calendarRouter);
app.use("/api/ai-scheduler", aiSchedulerRouter);
app.use("/api/performance", performanceRouter);

// Cron job
cron.schedule("1 0 * * *", async () => {
  try {
    await SlotService.advanceSlotsService();
  } catch (err) {
    console.error("Slot cron error:", err);
  }
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler LAST
app.use(ErrorHandler);

export default app;
