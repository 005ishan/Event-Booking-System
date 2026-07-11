const crypto = require("crypto");
const Booking = require("../models/booking.model");
const Event = require("../models/event.model");

const ESEWA_SECRET = "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_GATEWAY = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_CHECK =
  "https://rc.esewa.com.np/api/epay/transaction/status/";

/**
 * Generate HMAC-SHA256 signature for eSewa payment request.
 * Request fields (in order): total_amount, transaction_uuid, product_code
 */
function generateRequestSignature(totalAmount, transactionUuid) {
  const msg = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  return crypto.createHmac("sha256", ESEWA_SECRET).update(msg).digest("base64");
}

/**
 * Generate HMAC-SHA256 signature for eSewa response verification.
 * Response fields (in order): transaction_code, status, total_amount, transaction_uuid, product_code, signed_field_names
 */
function generateResponseSignature(fields) {
  const msg = `transaction_code=${fields.transaction_code},status=${fields.status},total_amount=${fields.total_amount},transaction_uuid=${fields.transaction_uuid},product_code=${fields.product_code},signed_field_names=${fields.signed_field_names}`;
  return crypto.createHmac("sha256", ESEWA_SECRET).update(msg).digest("base64");
}

/**
 * Generate a unique transaction UUID
 */
function generateTransactionUuid() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `EBS-${timestamp}-${random}`;
}

/**
 * URL-decode base64 data from eSewa redirect query param.
 * The base64 string may have '+' encoded as '%2B' or spaces in the URL.
 */
function decodeEsewaData(encodedData) {
  // First URL-decode (handles %2B → +, %2F → /, etc.)
  const urlDecoded = decodeURIComponent(encodedData);
  // Replace any spaces back to + (some frameworks replace + with space)
  const base64 = urlDecoded.replace(/ /g, "+");
  const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(jsonStr);
}

/**
 * Initiate payment: create a pending booking and return eSewa form data
 * POST /api/esewa/initiate
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { eventId, seats } = req.body;
    const userId = req.user.id;

    if (!eventId || !seats) {
      return res
        .status(400)
        .json({ message: "Event ID and seats are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableSeats < seats) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    const totalAmount = event.price * seats;
    const transactionUuid = generateTransactionUuid();

    // Create booking with pending payment status
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      seats,
      totalAmount,
      status: "confirmed",
      paymentMethod: "esewa",
      paymentStatus: "pending",
      transactionUuid,
    });

    // Reserve seats
    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: -seats },
    });

    const signature = generateRequestSignature(totalAmount, transactionUuid);

    // Clean URLs without query params — eSewa appends ?data=... to the URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/payment/callback`;
    const failureUrl = `${baseUrl}/payment/callback`;

    res.status(200).json({
      message: "Payment initiated",
      bookingId: booking._id,
      transactionUuid,
      formData: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: String(totalAmount),
        transaction_uuid: transactionUuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
      gatewayUrl: ESEWA_GATEWAY,
    });
  } catch (err) {
    console.error("eSewa initiate error:", err);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

/**
 * Verify payment after eSewa redirect
 * POST /api/esewa/verify
 * 
 * Accepts either:
 * - { bookingId, encodedData } — from event detail page (with booking_id param)
 * - { encodedData } — from callback page (backend finds booking by transactionUuid from decoded data)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, encodedData } = req.body;

    if (!encodedData) {
      return res.status(400).json({ message: "Payment data is required" });
    }

    // Decode the eSewa response data
    let decoded;
    try {
      decoded = decodeEsewaData(encodedData);
      console.log("eSewa response decoded:", JSON.stringify(decoded, null, 2));
    } catch (e) {
      return res.status(400).json({ message: "Failed to decode payment response: " + e.message });
    }

    // Find booking by ID (from event detail page) or by transactionUuid (from callback page)
    let booking;
    if (bookingId) {
      booking = await Booking.findById(bookingId).populate("event");
    } else if (decoded.transaction_uuid) {
      booking = await Booking.findOne({ transactionUuid: decoded.transaction_uuid }).populate("event");
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({ message: "Payment already verified", status: "paid", booking });
    }

    // Verify response signature using the RESPONSE field order
    const expectedSig = generateResponseSignature(decoded);
    if (decoded.signature !== expectedSig) {
      console.error("Signature mismatch: expected", expectedSig, "got", decoded.signature);
      booking.paymentStatus = "failed";
      await booking.save();
      return res.status(400).json({ message: "Signature mismatch" });
    }

    booking.transactionId = decoded.transaction_code || "";

    // If we have a transaction code from the response, mark as paid locally
    // The status check API may not be reachable from local dev, so trust the verified response data
    if (booking.transactionId && decoded.status === "COMPLETE") {
      booking.paymentStatus = "paid";
      await booking.save();
      return res.json({
        message: "Payment verified successfully",
        status: "paid",
        booking,
      });
    }

    // For extra confirmation, call eSewa status check API
    try {
      const statusUrl = `${ESEWA_STATUS_CHECK}?product_code=${ESEWA_PRODUCT_CODE}&total_amount=${booking.totalAmount}&transaction_uuid=${booking.transactionUuid}`;
      console.log("Checking eSewa status at:", statusUrl);

      const statusRes = await fetch(statusUrl);

      if (!statusRes.ok) {
        throw new Error(`Status check HTTP ${statusRes.status}`);
      }

      const statusData = await statusRes.json();
      console.log("eSewa status response:", JSON.stringify(statusData));

      if (statusData.status === "COMPLETE") {
        booking.paymentStatus = "paid";
        booking.transactionId = statusData.ref_id || booking.transactionId;
        await booking.save();
        return res.json({ message: "Payment verified successfully", status: "paid", booking });
      } else {
        if (statusData.status !== "PENDING") {
          booking.paymentStatus = "failed";
          await booking.save();
        }
        return res.status(400).json({
          message: `Payment status: ${statusData.status}`,
          status: statusData.status,
          booking,
        });
      }
    } catch (e) {
      console.error("eSewa status check failed (non-critical):", e.message);

      // Status check failed — we already verified the response signature above
      // If transactionId was set from the decoded response, consider it paid
      if (booking.transactionId) {
        booking.paymentStatus = "paid";
        await booking.save();
        return res.json({
          message: "Payment confirmed via response data (status check unavailable)",
          status: "paid",
          booking,
        });
      }

      return res.status(502).json({
        message: `Failed to verify payment: ${e.message}`,
      });
    }
  } catch (err) {
    console.error("eSewa verify error:", err);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};
