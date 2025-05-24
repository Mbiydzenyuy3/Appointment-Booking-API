// app.js
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

// Route Imports
import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js";
import appointmentRouter from "./src/routes/appointment.js";
import slotRouter from "./src/routes/slot.js";
import providerRouter from "./src/routes/provider.js";
import serviceRoutes from "./src/routes/service.js";

const app = express();

// Setup __dirname (since ES modules don't have it by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/appointments", appointmentRouter);
app.use("/slots", slotRouter);
app.use("/providers", providerRouter);
app.use("/services", serviceRoutes);

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Add error handler middleware
app.use(ErrorHandler);

export { app, initSocket };
