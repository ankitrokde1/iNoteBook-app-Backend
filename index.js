require("dotenv").config();
const connectMongo = require("./db");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
var cors = require("cors");

app.use(
  cors({
    origin: process.env.REACT_APP_API_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
connectMongo();

const port = process.env.PORT || 5000;

// Availble Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// ...existing code...

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Render will restart the service
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1); // Render will restart the service
});


app.listen(port, () => {
  console.log(`iNoteBook backend listening at port: ${port}`);
});
