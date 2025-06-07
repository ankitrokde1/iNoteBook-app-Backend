const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");
const sendEmail = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

// Create User
exports.createUser = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({
        success,
        error: "Sorry a user with this email already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    });
    success = true;
    res.json({ success, message: "User created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Login
exports.login = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success,
        error: "Please try to login with correct credentials",
      });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({
        success,
        error: "Please try to login with correct credentials",
      });
    }
    const data = {
      user: {
        id: user.id,
        name: user.name,
      },
    };
    const token = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });
     console.log("Generated Token:", token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: ONE_WEEK,
    });
    success = true;
    res.json({ success, message: "Logged in successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Get User
exports.getUser = async (req, res) => {
  try {
    let userID = req.user.id;
    if (!userID) {
      return res.status(400).json({ error: "User ID not found" });
    }
    const user = await User.findById(userID);
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Logout
exports.logout = (req, res) => {
  if (!req.cookies.token) {
    return res.status(400).json({ error: "User is not logged in" });
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const token = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.REACT_APP_API_URL}/reset-password/${token}`;
    const html = `...`; // You can copy your HTML template here

    await sendEmail(user.email, "Reset your iNoteBook password", html);

    res.json({ success: true, message: "Reset link sent to your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).send("Server error");
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid token" });

    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
