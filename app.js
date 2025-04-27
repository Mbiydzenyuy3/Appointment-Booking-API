//app.js

import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import { initSocket } from "./src/sockets/socket.js";

import authRouter from "./src/routes/auth.js";
import indexRouter from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/error-middleware.js";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//setup logger format
const morganFormat = process.env.NODE_ENV === "production" ? "dev" : "combined";
app.use(morgan(morganFormat));

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Routers
app.use("/auth", authRouter);
app.use("/api", indexRouter);

//Swagger API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export { app, initSocket };
