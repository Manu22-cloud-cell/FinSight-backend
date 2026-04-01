const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.get("/", (req, res) => {
  res.send("FinSight API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

module.exports = app;