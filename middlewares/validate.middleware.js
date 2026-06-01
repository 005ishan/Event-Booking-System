exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  next();
};

exports.validateBooking = (req, res, next) => {
  const { eventId, seats } = req.body;

  if (!eventId || !seats) {
    return res.status(400).json({ message: "Event and seats are required" });
  }

  if (seats < 1) {
    return res.status(400).json({ message: "Seats must be at least 1" });
  }

  next();
};

exports.validateEvent = (req, res, next) => {
  const { title, description, category, date, time, location, price, totalSeats } = req.body;

  if (!title || !description || !category || !date || !time || !location || !price || !totalSeats) {
    return res.status(400).json({ message: "All event fields are required" });
  }

  if (price < 0) {
    return res.status(400).json({ message: "Price cannot be negative" });
  }

  if (totalSeats < 1) {
    return res.status(400).json({ message: "Total seats must be at least 1" });
  }

  if (new Date(date) < new Date()) {
    return res.status(400).json({ message: "Event date cannot be in the past" });
  }

  next();
};