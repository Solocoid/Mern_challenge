const express = require("express");
const {
    fetchAndSeedData,
    listTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
    getCombinedData,
} = require("../controllers/dataController");
const router = express.Router();

router.get("/seed", fetchAndSeedData); // For seeding data
router.get("/transactions", listTransactions); // For listing transactions
router.get("/statistics", getStatistics); // For statistics
router.get("/barchart", getBarChart); // For bar chart data
router.get("/piechart", getPieChart); // For pie chart data
router.get("/combined", getCombinedData); // For combined data

module.exports = router;
