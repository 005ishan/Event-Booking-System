const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { eventUpload } = require("../middlewares/upload.middleware");
const { uploadEventImage } = require("../controllers/upload.controller");

router.post("/", protect, eventUpload.single("eventImage"), uploadEventImage);

module.exports = router;
