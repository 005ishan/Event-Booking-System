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

router.get("/", getAllEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/category/:category", getEventsByCategory);
router.get("/:eventId", getEventById);

router.post("/", protect, validateEvent, createEvent);
router.put("/:eventId", protect, validateEvent, updateEvent);
router.delete("/:eventId", protect, deleteEvent);

module.exports = router;