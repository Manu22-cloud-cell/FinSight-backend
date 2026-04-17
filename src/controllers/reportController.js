const reportService = require("../services/reportService");

// Get Reports
exports.getReports = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { type, date, month, year } = req.query;

        let result;

        if (type === "daily") {
            result = await reportService.getDailyReport(userId, date);
        }
        else if (type === "monthly") {
            result = await reportService.getMonthlyReport(userId, month, year);
        }
        else if (type === "yearly") {
            result = await reportService.getYearlyReport(userId, year);
        }
        else {
            return res.status(400).json({ message: "Invalid report type" });
        }

        res.status(200).json({ success: true, data: result });

    } catch (error) {
        next(error);
    }
};


// Download
exports.downloadReport = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { type, year } = req.query;

        const fileUrl = await reportService.downloadReport(userId, type, year);

        res.status(200).json({ success: true, fileUrl });

    } catch (error) {
        next(error);
    }
};


// History
exports.getDownloadedReports = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const reports = await reportService.getDownloadedReports(userId);

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });

    } catch (error) {
        next(error);
    }
};