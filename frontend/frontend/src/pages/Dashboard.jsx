import React, { useState } from "react";
import TransactionsTable from "../components/TransactionsTable";
import Statistics from "../components/Statistics";
import BarChartComponent from "../components/BarChart";
import PieChartComponent from "../components/PieChart";

const Dashboard = () => {
    const [month, setMonth] = useState(3);

    return (
        <div>
            <h1>Dashboard</h1>
            <TransactionsTable />
            <Statistics month={month} />
            <BarChartComponent month={month} />
            <PieChartComponent month={month} />
        </div>
    );
};

export default Dashboard;
