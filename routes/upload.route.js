const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { profileUpload, eventUpload } = require("../middlewares/upload.middleware");
const { uploadProfilePicture, removeProfilePicture, uploadEventImage } = require("../controllers/upload.controller");

router.post("/", protect, profileUpload.single("profilePicture"), uploadProfilePicture);
router.delete("/", protect, removeProfilePicture);

router.post("/event", protect, eventUpload.single("eventImage"), uploadEventImage);

module.exports = router;
