const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const generateExpiry = require("../utils/generateExpiry");
const { sendOtpEmail, sendWelcomeEmail, sendResetPasswordEmail } = require("../utils/sendEmail");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // In development mode, auto-verify user and return token immediately
    if (process.env.NODE_ENV !== "production") {
      user.isVerified = true;
      await user.save();

      const token = generateToken(user._id);

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: { name: user.name, email: user.email, profilePicture: user.profilePicture || "" },
      });
    }

    const otp = generateOtp();
    const otpExpiry = generateExpiry(10);

    await Otp.create({ email, otp, otpExpiry });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.warn("Failed to send OTP email:", emailErr.message);
    }

    res.status(201).json({ message: "User registered. Please verify OTP." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res
        .status(404)
        .json({ message: "OTP not found or already expired" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.otpExpiry < Date.now()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { returnDocument: "after" },
    );
    await Otp.deleteOne({ email });    try {
      await sendWelcomeEmail(email, user.name);
    } catch (emailErr) {
      console.warn("Failed to send welcome email:", emailErr.message);
    }

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({ message: "Login successful", token, user: { name: user.name, email: user.email, profilePicture: user.profilePicture || "" } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    const otpExpiry = generateExpiry(10);

    await Otp.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true }
    );

    try {
      await sendResetPasswordEmail(email, otp);
    } catch (emailErr) {
      console.warn("Failed to send reset password email:", emailErr.message);
    }

    res.status(200).json({ message: "Password reset OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.otpExpiry < Date.now()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteOne({ email });

    res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
