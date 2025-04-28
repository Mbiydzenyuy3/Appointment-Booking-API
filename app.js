// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";

import { initSocket } from "./src/sockets/socket.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";

import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js";
import appointmentRouter from "./src/routes/appointment.js";
import slotRouter from "./src/routes/slot.js";
import providerRouter from "./src/routes/provider.js";

const app = express();

// Setup __dirname because ES Modules don't have it by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/appointments", appointmentRouter);
app.use("/slots", slotRouter);
app.use("/providers", providerRouter);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

export { app, initSocket };
