const express = require("express");
const router = express.Router();
const { registerUser, verifyOtp, loginUser, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../middlewares/validate.middleware");

router.post("/register", validateRegister, registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", validateLogin, loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;