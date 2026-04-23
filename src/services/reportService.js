const reportRepository = require("../repositories/reportRepository");
const s3 = require("../config/s3");
const AppError = require("../utils/AppError");

// CSV Generators
const generateCSV = (transactions) => {
  let csv = "Date,Type,Category,Note,Amount\n";

  transactions.forEach((t) => {
    csv += `${t.date},${t.type},${t.category},${t.note || "-"},${t.amount}\n`;
  });

  return csv;
};

const generateYearlyCSV = (data, year) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let csv = `Year,${year}\n\nMonth,Income,Expense\n`;

  data.forEach((row) => {
    csv += `${months[row.month - 1]},${row.income},${row.expense}\n`;
  });

  return csv;
};

// Helper function
const calculateTotals = (transactions) => {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
  };
};


// ===================== REPORTS ===================== //

// Daily
exports.getDailyReport = async (userId, date) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!date) {
    date = new Date().toISOString().split("T")[0];
  }

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  const transactions =
    await reportRepository.getTransactionsByDateRange(userId, start, end);

  const totals = calculateTotals(transactions || []);

  return { transactions, totals };
};


// Monthly
exports.getMonthlyReport = async (userId, month, year) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!month || !year) {
    const now = new Date();
    month = now.getMonth() + 1;
    year = now.getFullYear();
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const transactions =
    await reportRepository.getTransactionsByDateRange(userId, start, end);

  const totals = calculateTotals(transactions || []);

  return { transactions, totals };
};


// Yearly
exports.getYearlyReport = async (userId, year) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!year) {
    year = new Date().getFullYear();
  }

  const data = await reportRepository.getYearlyTransactions(userId, year);

  let totalIncome = 0;
  let totalExpense = 0;

  (data || []).forEach((m) => {
    totalIncome += m.income;
    totalExpense += m.expense;
  });

  return {
    data,
    totals: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    },
  };
};


// ===================== DOWNLOAD ===================== //

exports.downloadReport = async (userId, type, year) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!type) {
    throw new AppError("Report type is required", 400);
  }

  let csv;
  let fileName;

  if (type === "daily") {
    const report = await exports.getDailyReport(userId);
    csv = generateCSV(report.transactions);
    fileName = `daily-${userId}-${Date.now()}.csv`;
  }

  else if (type === "monthly") {
    const report = await exports.getMonthlyReport(userId);
    csv = generateCSV(report.transactions);
    fileName = `monthly-${userId}-${Date.now()}.csv`;
  }

  else if (type === "yearly") {
    const report = await exports.getYearlyReport(userId, year);
    csv = generateYearlyCSV(report.data, year);
    fileName = `yearly-${userId}-${Date.now()}.csv`;
  }

  else {
    throw new AppError("Invalid report type", 400);
  }

  // Upload to S3
  const { PutObjectCommand } = require("@aws-sdk/client-s3");

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `reports/${fileName}`,
    Body: csv,
    ContentType: "text/csv",
  });

  try {
    await s3.send(command);
  } catch (err) {
    console.error("S3 Upload Error:", err.message);
    throw new AppError("Failed to upload report", 500);
  }

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/reports/${fileName}`;

  await reportRepository.saveDownloadedReport({
    userId,
    fileUrl,
  });

  return fileUrl;
};


// ===================== HISTORY ===================== //

exports.getDownloadedReports = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  return reportRepository.getDownloadedReports(userId);
};