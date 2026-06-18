const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { uploadProfilePicture, removeProfilePicture } = require("../controllers/upload.controller");

router.post("/", protect, upload.single("profilePicture"), uploadProfilePicture);
router.delete("/", protect, removeProfilePicture);

module.exports = router;
