const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  initiatePayment,
  verifyPayment,
} = require("../controllers/esewa.controller");

router.post("/initiate", protect, initiatePayment);
router.post("/verify", protect, verifyPayment);

module.exports = router;
