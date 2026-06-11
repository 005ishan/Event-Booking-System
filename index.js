const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/bookings", require("./routes/booking.route"));
app.use("/api/events", require("./routes/event.route"));

// Error Middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Connect DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log(err));