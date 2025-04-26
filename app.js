//app.js

import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import cors from "cors"
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";

// import winstonLogger from "./src/utils/logger.js";

import authRouter from "./src/routes/auth.js";
// import indexRouter from "./routes/index.js";
// import usersRouter from "./routes/users.js";
// import appointmentRouter from "./routes/appointment.js"
//import providerRouter from "./routes/provider.js"
// import slotRouter from "./routes/slot.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//setup logger format
const morganFormat = process.env.NODE_ENV === "production" ? "dev" : "combined";
app.use(morgan(morganFormat));

//middlewares
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.use("/auth", authRouter);
//app.use("/appointments", appointmentRouter)
//app.use()
//app.use("/provides", providerRouter);
//app.use("/slots", slotRouter)

//Swagger API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Fallback error handler (optional)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

export default app;
