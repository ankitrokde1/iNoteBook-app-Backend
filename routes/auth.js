const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");
const authController = require("../controller/authController");

// Create User
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  authController.createUser
);

// Login
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  authController.login
);

// Get User
router.post("/getuser", fetchUser, authController.getUser);

// Logout
router.post("/logout", authController.logout);

// Forgot Password
router.post(
  "/forgot-password",
  [body("email", "Enter a valid email").isEmail()],
  authController.forgotPassword
);

// Reset Password
router.post(
  "/reset-password/:token",
  [
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  authController.resetPassword
);

router.get("/ping", (req, res) => {
  res.send("pong");
});

module.exports = router;
