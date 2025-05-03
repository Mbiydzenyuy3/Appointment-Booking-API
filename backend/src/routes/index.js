//routes/index.js
import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
const router = express.Router();

/* GET home page. */
router.get("/", authMiddleware, function (req, res, next) {
  res.send({ title: "Express" });
});

export default router;
