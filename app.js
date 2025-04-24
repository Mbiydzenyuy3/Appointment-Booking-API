import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
// import swaggerUi from "swagger-ui-express";
// import swaggerSpec from "./swaggerConfig.js";

import winstonLogger from "./src/utils/logger.js";

// import authRouter from "./routes/auth.js";
// import indexRouter from "./routes/index.js";
// import usersRouter from "./routes/users.js";
// import appointmentRouter from "./routes/appointment.js"
//import providerRouter from "./routes/provider.js"
// import slotRouter from "./routes/slot.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const morganFormat = process.env.NODE_ENV === "production" ? "dev" : "combined";
app.use(morgan(morganFormat, { stream: winstonLogger.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
// app.use("/users", usersRouter);
// app.use("/auth", authRouter);
// app.use("/tasks", tasksRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
