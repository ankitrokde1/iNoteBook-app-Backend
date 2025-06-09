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
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
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
    secure: true,
    sameSite: "None",
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
    const html = `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px 0;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0001; padding: 32px;">
        <div style="text-align: center;">
          <img src="https://img.icons8.com/color/96/000000/lock--v2.png" alt="Reset Password" style="margin-bottom: 16px;" />
          <h2 style="color: #2563eb; margin-bottom: 8px;">Reset Your Password</h2>
        </div>
        <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
          We received a request to reset your iNoteBook password.<br>
          Click the button below to set a new password. This link is valid for <b>15 minutes</b>.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetLink}" style="background: linear-gradient(90deg,#2563eb,#1e40af); color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 15px; color: #2563eb; text-align: center; margin-bottom: 24px;">
          Or <a href="${resetLink}" style="color: #1e40af; text-decoration: underline;">click here</a> if the button doesn't work.
        </p>
        <p style="font-size: 14px; color: #666;">
          If you did not request a password reset, you can safely ignore this email.<br>
          For your security, this link will expire soon.
        </p>
        <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;">
        <div style="text-align: center; font-size: 13px; color: #aaa;">
          &copy; ${new Date().getFullYear()} iNoteBook by Ankit Rokde. All rights reserved.
        </div>
      </div>
    </div>
  `;

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
