const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { validateEvent } = require("../middlewares/validate.middleware");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventsByCategory,
} = require("../controllers/event.controller");

// Public routes
router.get("/", getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/category/:category", getEventsByCategory);
router.get("/:eventId", getEventById);

// Admin routes
router.post("/", protect, adminOnly, validateEvent, createEvent);
router.put("/:eventId", protect, adminOnly, validateEvent, updateEvent);
router.delete("/:eventId", protect, adminOnly, deleteEvent);

module.exports = router;