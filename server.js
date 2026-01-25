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
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds for prices/candles
const NEWS_TTL = 300000; // 5 minutes for news

// Singleton Throttler to stay strictly under 60 req/min
const queue = [];
let processing = false;
async function throttledFetch(url) {
    return new Promise((resolve, reject) => {
        queue.push({ url, resolve, reject });
        processQueue();
    });
}

async function processQueue() {
    if (processing || queue.length === 0) return;
    processing = true;
    const { url, resolve, reject } = queue.shift();
    try {
        const response = await axios.get(url);
        resolve(response);
    } catch (e) { reject(e); }
    setTimeout(() => {
        processing = false;
        processQueue();
    }, 1100); // 1.1s delay between ANY Finnhub request
}

function getCached(key, ttl) {
    const entry = cache.get(key);
    if (entry && (Date.now() - entry.timestamp < ttl)) return entry.data;
    return null;
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

if (!FINNHUB_KEY) {
    console.error('CRITICAL ERROR: FINNHUB_API_KEY is not defined in environment variables.');
    console.error('Please add it to your Railway dashboard under "Variables".');
}

app.get('/api/quote', async (req, res) => {
    try {
        const { symbol } = req.query;
        const cacheKey = `quote_${symbol}`;
        const cached = getCached(cacheKey, CACHE_TTL);
        if (cached) return res.json(cached);

        // console.log(`Fetching Quote: ${symbol}`); // Removed as per snippet
        const response = await throttledFetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);

        // if (response.data.c === 0 && response.data.d === null) { // Removed as per snippet
        //     console.warn(`Empty response for ${symbol}. Market might be closed or symbol unsupported.`);
        // }

        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`API Error (/api/quote):`, error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.get('/api/candles', async (req, res) => {
    try {
        const { symbol, resolution, from, to, type } = req.query;
        const cacheKey = `candles_${symbol}_${resolution}_${from}_${to}`;
        const cached = getCached(cacheKey, CACHE_TTL);
        if (cached) return res.json(cached);

        // console.log(`Fetching Candles: ${symbol} (${type})`); // Removed as per snippet
        const endpoint = type === 'forex' ? 'forex/candle' : 'stock/candle';
        const response = await throttledFetch(`https://finnhub.io/api/v1/${endpoint}?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);

        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`API Error (/api/candles):`, error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        const { category } = req.query;
        const cacheKey = `news_${category}`;
        const cached = getCached(cacheKey, NEWS_TTL);
        if (cached) return res.json(cached);

        console.log(`Fetching News: ${category}`);
        const response = await axios.get(`https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_KEY}`);

        if (!Array.isArray(response.data)) {
            console.warn(`Unexpected news response for ${category}:`, response.data);
            return res.json([]);
        }

        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`API Error (/api/news):`, error.message);
        res.json([]); // Return empty list instead of erroring out UI
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

app.get('/api/health', async (req, res) => {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`);
        res.json({ status: 'ok', news_count: response.data.length, key_configured: !!FINNHUB_KEY });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
