//routes/index.js
import express from "express";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("WELCOME TO MY APPOINTMENT BOOKING APP");
});

export default router;
