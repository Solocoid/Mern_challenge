import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [month, setMonth] = useState(3); // Default: March
    const [total, setTotal] = useState(0);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/data/transactions?month=${month}&search=${search}&page=${page}`
            );
            setTransactions(response.data.transactions);
            setTotal(response.data.total);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [search, page, month]);

    return (
        <div>
            <h2>Transactions</h2>
            <select onChange={(e) => setMonth(e.target.value)} value={month}>
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                ))}
            </select>
            <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Date of Sale</th>
                        <th>Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx._id}>
                            <td>{tx.title}</td>
                            <td>{tx.description}</td>
                            <td>{tx.price}</td>
                            <td>{new Date(tx.dateOfSale).toLocaleDateString()}</td>
                            <td>{tx.sold ? "Yes" : "No"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                    Previous
                </button>
                <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
            </div>
        </div>
    );
};

export default TransactionsTable;
