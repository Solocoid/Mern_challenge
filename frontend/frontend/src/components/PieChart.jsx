import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const PieChartComponent = ({ month }) => {
    const [pieData, setPieData] = useState([]);
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    useEffect(() => {
        const fetchPieData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/data/piechart?month=${month}`
                );
                setPieData(response.data);
            } catch (err) {
                console.error("Error fetching pie chart data:", err);
            }
        };

        fetchPieData();
    }, [month]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                >
                    {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartComponent;
