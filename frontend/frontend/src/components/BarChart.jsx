import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const BarChartComponent = ({ month }) => {
    const [barData, setBarData] = useState([]);

    useEffect(() => {
        const fetchBarData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/data/barchart?month=${month}`
                );
                setBarData(response.data);
            } catch (err) {
                console.error("Error fetching bar chart data:", err);
            }
        };

        fetchBarData();
    }, [month]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartComponent;
