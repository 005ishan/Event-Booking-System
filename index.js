const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/bookings", require("./routes/booking.route"));
app.use("/api/events", require("./routes/event.route"));
app.use("/api/profile", require("./routes/profile.route"));
app.use("/api/profile/picture", require("./routes/upload.route"));
app.use("/api/events/upload", require("./routes/eventUpload.route"));
app.use("/api/esewa", require("./routes/esewa.route"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log(err));