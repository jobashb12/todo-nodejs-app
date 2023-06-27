const {
  register,
  login,
  verify,
  profile,
  updateProfile,
  updatePassword,
  forgetPassword,
  resetPassword,
  logout,
} = require("../controllers/user");
const { isAuthenticated } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.route("/login").get(login);
router.route("/register").post(register);
router.route("/verify").post(isAuthenticated, verify);
router.route("/profile").get(isAuthenticated, profile);
router.route("/profile/update").put(isAuthenticated, updateProfile);
router.route("/update/password").put(isAuthenticated, updatePassword);
router.route("/forget/password").put(forgetPassword);
router.route("/reset/password").put(resetPassword);
router.route("/logout").get(logout);

module.exports = router;
