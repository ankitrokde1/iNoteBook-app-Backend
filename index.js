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

app.listen(port, () => {
  console.log(`iNoteBook backend listening at port: ${port}`);
});
