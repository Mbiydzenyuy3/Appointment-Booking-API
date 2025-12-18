import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send(
    "WELCOME TO MY APPOINTMENT BOOKING APP\nCongratulations on building an Appointment Booking App"
  );
});

export default router;
