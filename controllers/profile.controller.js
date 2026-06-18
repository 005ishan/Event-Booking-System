const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// GET /api/profile — Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      firstName: user.firstName || user.name.split(" ")[0] || "",
      lastName: user.lastName || user.name.split(" ").slice(1).join(" ") || "",
      organizerName: user.organizerName || "",
      email: user.email,
      createdAt: user.createdAt,
      profilePicture: user.profilePicture || "",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/profile — Update user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, organizerName } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (organizerName !== undefined) updateData.organizerName = organizerName;

    // Keep the full `name` field in sync
    const newFirstName = firstName !== undefined ? firstName : req.user.firstName || req.user.name.split(" ")[0];
    const newLastName = lastName !== undefined ? lastName : req.user.lastName || req.user.name.split(" ").slice(1).join(" ");
    updateData.name = `${newFirstName} ${newLastName}`.trim();

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { returnDocument: "after" }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = {
      ...(await User.findById(req.user._id).select("-password")).toObject(),
    };

    res.json({
      message: "Profile updated successfully",
      user: {
        firstName: updatedUser.firstName || updatedUser.name.split(" ")[0] || "",
        lastName: updatedUser.lastName || updatedUser.name.split(" ").slice(1).join(" ") || "",
        organizerName: updatedUser.organizerName || "",
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture || "",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/profile/password — Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
