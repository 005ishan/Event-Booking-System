const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    seats: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    paymentMethod: { type: String, default: "esewa" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, default: "" },
    transactionUuid: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
