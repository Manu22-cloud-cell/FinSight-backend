const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes=require("./routes/authRoutes");

app.get("/", (req, res) => {
  res.send("FinSight API is running");
});

app.use("/api/auth",authRoutes);

module.exports = app;