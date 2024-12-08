import React, { useState, useEffect } from "react";
import axios from "axios";

const Statistics = ({ month }) => {
    const [statistics, setStatistics] = useState({
        totalSaleAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
    });

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/data/statistics?month=${month}`
                );
                setStatistics(response.data);
            } catch (err) {
                console.error("Error fetching statistics:", err);
            }
        };

        fetchStatistics();
    }, [month]);

    return (
        <div>
            <h2>Statistics</h2>
            <div>Total Sale Amount: {statistics.totalSaleAmount}</div>
            <div>Total Sold Items: {statistics.totalSoldItems}</div>
            <div>Total Not Sold Items: {statistics.totalNotSoldItems}</div>
        </div>
    );
};

export default Statistics;
