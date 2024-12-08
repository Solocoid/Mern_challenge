const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");



const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/data", require("./routes/dataRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));