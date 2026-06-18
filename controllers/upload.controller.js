const User = require("../models/user.model");
const path = require("path");
const fs = require("fs");

// POST /api/profile/upload-picture — Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Delete old profile picture if it exists
    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, "..", user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store relative path to the uploaded file
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

// DELETE /api/profile/upload-picture — Remove profile picture
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
