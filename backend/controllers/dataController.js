const axios = require("axios");
const Transaction = require("../models/Transaction");

const fetchAndSeedData = async (req, res) => {
    try {
        // Fetch data from the third-party API
        const { data } = await axios.get(
            "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
        );

        console.log(`Fetched ${data.length} transactions from the API.`);

        // Clear existing data (optional)
        await Transaction.deleteMany();

        // Insert fetched data into the database
        const seededData = await Transaction.insertMany(data);

        console.log(`Inserted ${seededData.length} transactions into the database.`);

        res.status(201).json({
            message: "Data fetched and seeded successfully",
            fetched: data.length,
            inserted: seededData.length,
        });
    } catch (err) {
        console.error("Error fetching or seeding data:", err.message);
        res.status(500).json({ message: "Failed to fetch and seed data" });
    }
};

// List Transactions with Search and Pagination
const listTransactions = async (req, res) => {
    try {
        const { search = "", page = 1, perPage = 10 } = req.query;

        // Build the query object
        let query = {};
        if (search) {
            const numericSearch = parseFloat(search);
            query = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    // Check if `search` is a valid number before filtering by price
                    ...(isNaN(numericSearch) ? [] : [{ price: numericSearch }]),
                ],
            };
        }

        // Pagination
        const skip = (page - 1) * perPage;

        // Fetch data from MongoDB
        const transactions = await Transaction.find(query)
            .skip(skip)
            .limit(parseInt(perPage));

        // Count total transactions for pagination
        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            page: parseInt(page),
            perPage: parseInt(perPage),
            total,
            transactions,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
};

// Get Statistics for a Selected Month
const getStatistics = async (req, res) => {
    try {
        const { month } = req.query;

        // Validate month parameter
        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                message: "Invalid month parameter. Please provide a value between 1 and 12.",
            });
        }

        // Convert month to integer
        const monthInt = parseInt(month);

        // Aggregate data for statistics
        const stats = await Transaction.aggregate([
            {
                // Extract month and filter fields
                $project: {
                    price: 1,
                    sold: 1,
                    month: { $month: "$dateOfSale" },
                },
            },
            {
                // Match transactions for the selected month
                $match: { month: monthInt },
            },
            {
                // Group data for statistics
                $group: {
                    _id: null,
                    totalSaleAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$sold", true] }, "$price", 0],
                        },
                    },
                    totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
                    totalNotSoldItems: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } },
                },
            },
        ]);

        // If no data found, return default statistics
        const response = stats[0] || {
            totalSaleAmount: 0,
            totalSoldItems: 0,
            totalNotSoldItems: 0,
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching statistics:", err.message);
        res.status(500).json({ message: "Failed to fetch statistics" });
    }
};



// Get Data for Bar Chart
const getBarChart = async (req, res) => {
    try {
        const { month } = req.query;

        // Validate month parameter
        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                message: "Invalid month parameter. Please provide a value between 1 and 12.",
            });
        }

        // Convert month to integer
        const monthInt = parseInt(month);

        // Aggregate data for price ranges
        const barChartData = await Transaction.aggregate([
            {
                // Extract month from dateOfSale
                $project: {
                    price: 1,
                    month: { $month: "$dateOfSale" },
                },
            },
            {
                // Match transactions of the selected month
                $match: { month: monthInt },
            },
            {
                // Classify price ranges
                $bucket: {
                    groupBy: "$price", // Field to group by
                    boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
                    default: "901-above",
                    output: {
                        count: { $sum: 1 }, // Count the number of items in each range
                    },
                },
            },
            {
                // Add readable range labels
                $addFields: {
                    range: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 0] }, then: "0-100" },
                                { case: { $eq: ["$_id", 100] }, then: "101-200" },
                                { case: { $eq: ["$_id", 200] }, then: "201-300" },
                                { case: { $eq: ["$_id", 300] }, then: "301-400" },
                                { case: { $eq: ["$_id", 400] }, then: "401-500" },
                                { case: { $eq: ["$_id", 500] }, then: "501-600" },
                                { case: { $eq: ["$_id", 600] }, then: "601-700" },
                                { case: { $eq: ["$_id", 700] }, then: "701-800" },
                                { case: { $eq: ["$_id", 800] }, then: "801-900" },
                            ],
                            default: "901-above",
                        },
                    },
                },
            },
            {
                // Remove the original `_id` field
                $project: {
                    _id: 0,
                    range: 1,
                    count: 1,
                },
            },
        ]);

        res.status(200).json(barChartData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Failed to generate bar chart data" });
    }
};


// Get Data for Pie Chart
const getPieChart = async (req, res) => {
    try {
        const { month } = req.query;

        // Validate month parameter
        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                message: "Invalid month parameter. Please provide a value between 1 and 12.",
            });
        }

        // Convert month to integer
        const monthInt = parseInt(month);

        // Aggregate data for categories
        const pieChartData = await Transaction.aggregate([
            {
                // Extract month from dateOfSale
                $project: {
                    category: 1,
                    month: { $month: "$dateOfSale" },
                },
            },
            {
                // Match transactions of the selected month
                $match: { month: monthInt },
            },
            {
                // Group by category and count items
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            {
                // Rename `_id` to `category`
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1,
                },
            },
        ]);

        res.status(200).json(pieChartData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Failed to generate pie chart data" });
    }
};

// Get Combined Data from All APIs
const getCombinedData = async (req, res) => {
    try {
        const { month } = req.query;

        // Validate month parameter
        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                message: "Invalid month parameter. Please provide a value between 1 and 12.",
            });
        }

        // Convert month to integer
        const monthInt = parseInt(month);

        // Fetch data for each API
        const statisticsPromise = Transaction.aggregate([
            {
                $project: {
                    price: 1,
                    sold: 1,
                    month: { $month: "$dateOfSale" },
                },
            },
            { $match: { month: monthInt } },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: "$price" },
                    totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
                    totalNotSoldItems: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } },
                },
            },
        ]);

        const barChartPromise = Transaction.aggregate([
            {
                $project: {
                    price: 1,
                    month: { $month: "$dateOfSale" },
                },
            },
            { $match: { month: monthInt } },
            {
                $bucket: {
                    groupBy: "$price",
                    boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
                    default: "901-above",
                    output: { count: { $sum: 1 } },
                },
            },
            {
                $addFields: {
                    range: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 0] }, then: "0-100" },
                                { case: { $eq: ["$_id", 100] }, then: "101-200" },
                                { case: { $eq: ["$_id", 200] }, then: "201-300" },
                                { case: { $eq: ["$_id", 300] }, then: "301-400" },
                                { case: { $eq: ["$_id", 400] }, then: "401-500" },
                                { case: { $eq: ["$_id", 500] }, then: "501-600" },
                                { case: { $eq: ["$_id", 600] }, then: "601-700" },
                                { case: { $eq: ["$_id", 700] }, then: "701-800" },
                                { case: { $eq: ["$_id", 800] }, then: "801-900" },
                            ],
                            default: "901-above",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    range: 1,
                    count: 1,
                },
            },
        ]);

        const pieChartPromise = Transaction.aggregate([
            {
                $project: {
                    category: 1,
                    month: { $month: "$dateOfSale" },
                },
            },
            { $match: { month: monthInt } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1,
                },
            },
        ]);

        // Wait for all promises to resolve
        const [statistics, barChartData, pieChartData] = await Promise.all([
            statisticsPromise,
            barChartPromise,
            pieChartPromise,
        ]);

        // Format the response
        const combinedData = {
            statistics: statistics[0] || {
                totalSaleAmount: 0,
                totalSoldItems: 0,
                totalNotSoldItems: 0,
            },
            barChart: barChartData,
            pieChart: pieChartData,
        };

        res.status(200).json(combinedData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Failed to get combined data" });
    }
};

module.exports = {
    fetchAndSeedData,
    listTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
    getCombinedData,
};


