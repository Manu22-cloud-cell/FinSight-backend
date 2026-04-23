const asyncHandler = require("../utils/asyncHandler");
const reportService = require("../services/reportService");

// Get Reports
exports.getReports = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { type, date, month, year } = req.query;

    let result;

    if (type === "daily") {
        result = await reportService.getDailyReport(userId, date);
    } else if (type === "monthly") {
        result = await reportService.getMonthlyReport(userId, month, year);
    } else if (type === "yearly") {
        result = await reportService.getYearlyReport(userId, year);
    } else {
        const error = new Error("Invalid report type");
        error.status = 400;
        throw error;
    }

    res.status(200).json({ success: true, data: result });
});


// Download
exports.downloadReport = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { type, year } = req.query;

    const fileUrl = await reportService.downloadReport(userId, type, year);

    res.status(200).json({ success: true, fileUrl });
});


// History
exports.getDownloadedReports = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const reports = await reportService.getDownloadedReports(userId);

    res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
    });
});