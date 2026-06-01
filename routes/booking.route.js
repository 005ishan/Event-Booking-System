const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { validateBooking } = require("../middleware/validate.middleware");
const {
  createBooking,
  cancelBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/booking.controller");

router.post("/", protect, validateBooking, createBooking);
router.put("/cancel/:bookingId", protect, cancelBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:bookingId", protect, getBookingById);

router.get("/", protect, adminOnly, getAllBookings);
router.put("/:bookingId/status", protect, adminOnly, updateBookingStatus);

module.exports = router;