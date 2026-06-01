const express = require("express");
const router = express.Router();
const { registerUser, verifyOtp, loginUser } = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../middleware/validate.middleware");

router.post("/register", validateRegister, registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", validateLogin, loginUser);

module.exports = router;