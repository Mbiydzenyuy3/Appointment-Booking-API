//routes/index.js
import express from "express";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "WELCOME TO MY APPOINTMENT BOOKING APP",
    note: "Congratulations on building an Appointment Booking App"
  });
});

export default router;
