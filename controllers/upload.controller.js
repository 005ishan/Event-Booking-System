const User = require("../models/user.model");
const path = require("path");
const fs = require("fs");

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, "..", user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const relativePath = `/uploads/${req.file.filename}`;
    user.profilePicture = relativePath;
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: relativePath,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, "..", user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    user.profilePicture = "";
    await user.save();
    res.json({ message: "Profile picture removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadEventImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const relativePath = `/uploads/events/${req.file.filename}`;
    res.json({
      message: "Event image uploaded successfully",
      image: relativePath,
    });
  } catch (err) {
    console.error("Event image upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
