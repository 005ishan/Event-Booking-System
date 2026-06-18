const Booking = require("../models/booking.model");
const Event = require("../models/event.model");
const User = require("../models/user.model");
const { sendBookingConfirmationEmail } = require("../utils/sendEmail");

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { eventId, seats } = req.body;
    const userId = req.user.id;

    if (!eventId || !seats) {
      return res.status(400).json({ message: "Event and seats are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableSeats < seats) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    const totalAmount = event.price * seats;

    // Create booking
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      seats,
      totalAmount,
    });

    // Reduce available seats
    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: -seats },
    });

    // Get user for email
    const user = await User.findById(userId);

    // Send confirmation email
    await sendBookingConfirmationEmail(user.email, user.name, {
      bookingId: booking._id,
      eventName: event.title,
      date: new Date(event.date).toDateString(),
      time: event.time,
      location: event.location,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
    });

    res.status(201).json({ message: "Booking confirmed!", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Restore available seats
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableSeats: booking.seats },
    });

    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get my bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("event")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ---- ADMIN ----

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("event")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status },
      { returnDocument: "after" },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
