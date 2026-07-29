const express = require("express");
const router = express.Router();
const { subscribe, unsubscribe, getAllSubscribers, deleteSubscriber } = require("../controllers/newsletter.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);
router.get("/subscribers", protect, getAllSubscribers);
router.delete("/subscribers/:id", protect, deleteSubscriber);

module.exports = router;
