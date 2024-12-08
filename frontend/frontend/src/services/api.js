import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/data";

// Fetch statistics data
export const fetchStatistics = (month) =>
    axios.get(`${API_BASE_URL}/statistics`, { params: { month } });

// Fetch bar chart data
export const fetchBarChart = (month) =>
    axios.get(`${API_BASE_URL}/barchart`, { params: { month } });

// Fetch pie chart data
export const fetchPieChart = (month) =>
    axios.get(`${API_BASE_URL}/piechart`, { params: { month } });

// Fetch combined data
export const fetchCombinedData = (month) =>
    axios.get(`${API_BASE_URL}/combined`, { params: { month } });

// Fetch transactions with search and pagination
export const fetchTransactions = (month, search = "", page = 1, perPage = 10) =>
    axios.get(`${API_BASE_URL}/transactions`, {
        params: { month, search, page, perPage },
    });
