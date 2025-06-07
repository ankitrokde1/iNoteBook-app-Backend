const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token || token === "undefined") {
    return res
      .status(401)
      .send({ error: "Please authenticate using a valid token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error); // Debugging line to log the error
    return res
      .status(401)
      .send({ error: "Please authenticate using a valid token" });
  }
};
module.exports = fetchUser;
