const express = require("express");
const router = express.Router();
const {
  singUp,
  Login,
  refresh,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.route("/singUp").post(singUp);

router.route("/login").post(Login);

router.route("/refresh").post(refresh);

router.route("/forgetPassword").post(forgotPassword);

router.route("/resetPassword/:token").post(resetPassword);

module.exports = router;
