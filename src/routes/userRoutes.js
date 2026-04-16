const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const userController = require("../controllers/userController");

router.get("/profile", protect, userController.getProfile);

router.put(
  "/profile",
  protect,
  upload.single("profilePic"),
  userController.updateProfile
);

router.put("/password", protect, userController.changePassword);

module.exports = router;