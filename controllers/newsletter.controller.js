const Newsletter = require("../models/newsletter.model");

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(200).json({ message: "You're already subscribed!" });
    }

    await Newsletter.create({ email: email.toLowerCase() });

    res.status(201).json({ message: "Subscribed to newsletter! 🎉" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const deleted = await Newsletter.findOneAndDelete({ email: email.toLowerCase() });
    if (!deleted) {
      return res.status(404).json({ message: "Email not found in our list" });
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * Number(limit);
    const subscribers = await Newsletter.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Newsletter.countDocuments(filter);

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      subscribers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Newsletter.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Subscriber not found" });
    }
    res.status(200).json({ message: "Subscriber removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
