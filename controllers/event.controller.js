const Event = require("../models/event.model");

// Create event (admin)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      price,
      totalSeats,
      image,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      location,
      price,
      totalSeats,
      availableSeats: totalSeats, // initially all seats available
      image,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all events (public)
exports.getAllEvents = async (req, res) => {
  try {
    const { category, date, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (date) filter.date = { $gte: new Date(date) };
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      events,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single event (public)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ event });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update event (admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      price,
      totalSeats,
      image,
    } = req.body;

    // If totalSeats changed, adjust availableSeats accordingly
    if (totalSeats && totalSeats !== event.totalSeats) {
      const bookedSeats = event.totalSeats - event.availableSeats;
      const newAvailableSeats = totalSeats - bookedSeats;

      if (newAvailableSeats < 0) {
        return res.status(400).json({
          message: `Cannot reduce seats. ${bookedSeats} seats already booked.`,
        });
      }

      event.availableSeats = newAvailableSeats;
      event.totalSeats = totalSeats;
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.category = category || event.category;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.price = price || event.price;
    event.image = image || event.image;

    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete event (admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.deleteOne();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get upcoming events (public)
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(10);

    res.status(200).json({ events });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get events by category (public)
exports.getEventsByCategory = async (req, res) => {
  try {
    const events = await Event.find({
      category: req.params.category,
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    res.status(200).json({ events });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};