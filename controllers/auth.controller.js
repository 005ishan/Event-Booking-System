const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const generateExpiry = require("../utils/generateExpiry");
const { sendOtpEmail, sendWelcomeEmail } = require("../utils/sendEmail");

// Register user
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

    // Generate OTP and send email
    const otp = generateOtp();
    const otpExpiry = generateExpiry(10);

    await Otp.create({ email, otp, otpExpiry });
    await sendOtpEmail(email, otp); 

    res.status(201).json({ message: "User registered. Please verify OTP." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
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

    // Mark user as verified and clean up OTP
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { returnDocument: "after" }, // returns updated user so we can get name
    );
    await Otp.deleteOne({ email });

    await sendWelcomeEmail(email, user.name); 

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
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
