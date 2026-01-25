const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Strict Cache Control for Service Worker (Ensures updates are detected)
app.use((req, res, next) => {
    if (req.url === '/sw.js') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
});

app.use(express.static('./')); // Serve frontend files

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

if (!FINNHUB_KEY) {
    console.error('CRITICAL ERROR: FINNHUB_API_KEY is not defined in environment variables.');
    console.error('Please add it to your Railway dashboard under "Variables".');
}

// API Routes
app.get('/api/quote', async (req, res) => {
    try {
        const { symbol } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error('API Error (/api/quote):', error.message);
        res.status(500).json({ error: error.message, detail: 'Check FINNHUB_API_KEY' });
    }
});

app.get('/api/candles', async (req, res) => {
    try {
        const { symbol, resolution, from, to, type } = req.query;
        const endpoint = type === 'forex' ? 'forex/candle' : 'stock/candle';
        const response = await axios.get(`https://finnhub.io/api/v1/${endpoint}?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        const { category } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/crypto/markets', async (req, res) => {
    try {
        const { ids } = req.query;
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/forex/latest', async (req, res) => {
    try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        res.json(response.data);
    } catch (error) {
        console.error('API Error (/api/forex/latest):', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
