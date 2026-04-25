require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use("/api/payments/webhook", express.raw({ type: "*/*" }));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const alertRoutes = require("./routes/alertRoutes");
const financialHealthRoutes = require("./routes/financialHealthRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const morganMiddleware = require("./middlewares/loggerMiddleware");
const errorHandler = require("./middlewares/errorHandler");

// Request logging
app.use(morganMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/health", financialHealthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);


// Central Error handler
app.use(errorHandler);

module.exports = app;