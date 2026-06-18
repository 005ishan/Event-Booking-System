const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { getProfile, updateProfile, changePassword } = require("../controllers/profile.controller");

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/password", protect, changePassword);

module.exports = router;
