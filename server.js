const express = require('express');
const axios = require('axios');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

if (!FINNHUB_KEY) {
    console.warn('WARNING: FINNHUB_API_KEY is not defined in .env file. Some features may not work.');
}

app.use(cors());
app.use(compression()); // Enable gzip compression for all responses
app.use(express.static(__dirname));

// Cache to prevent hitting rate limits too fast (simple in-memory)
const cache = new Map();
const CACHE_DURATION = 120000; // 120 seconds (optimized from 30s)

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

app.get('/api/crypto/markets', async (req, res) => {
    try {
        const { ids } = req.query;
        const cacheKey = `crypto_${ids}`;
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false`, { timeout: 10000 });
        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data || []);
    } catch (e) {
        console.error('Crypto error:', e.response ? e.response.data : e.message);
        res.status(500).json({ error: 'Failed to fetch crypto data', details: e.message });
    }
});

app.get('/api/stocks', async (req, res) => {
    try {
        const { symbols } = req.query; // Expecting comma separated symbols
        const symbolsList = symbols ? symbols.split(',') : ['AAPL', 'TSLA', 'AMZN', 'MSFT', 'GOOGL', 'NVDA', 'META', 'BRK.B'];

        const promises = symbolsList.map(s =>
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${FINNHUB_KEY}`)
        );

        const responses = await Promise.all(promises);
        const data = responses.map((r, i) => ({
            symbol: symbolsList[i],
            price: r.data.c,
            change: r.data.dp,
            high: r.data.h,
            low: r.data.l,
            open: r.data.o
        }));

        res.json(data);
    } catch (e) {
        console.error('Stocks error:', e.response ? e.response.data : e.message);
        res.status(500).json({ error: 'Failed to fetch stock data', details: e.message });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        const cacheKey = 'general_news';
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const response = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`, { timeout: 8000 });
        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        res.json(response.data || []);
    } catch (e) {
        console.error('News error:', e.message);
        res.json([]);
    }
});

app.get('/api/forex', async (req, res) => {
    try {
        const cacheKey = 'forex_rates';
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        // Mock forex data with realistic prices (using mock data due to Finnhub rate limits)
        const basePrices = {
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 149.50,
            'USD/CHF': 0.8750,
            'AUD/USD': 0.6580,
            'USD/CAD': 1.3520,
            'NZD/USD': 0.6150,
            'USD/TRY': 32.45,
            'EUR/TRY': 35.20,
            'EUR/GBP': 0.8575
        };

        const data = Object.entries(basePrices).map(([symbol, basePrice]) => {
            // Add small random variation to simulate real market movement
            const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
            const price = basePrice * (1 + variation);
            const change = (Math.random() - 0.5) * 2; // ±1% daily change

            return {
                symbol: symbol,
                price: parseFloat(price.toFixed(4)),
                change: parseFloat(change.toFixed(2))
            };
        });

        cache.set(cacheKey, { data: data, timestamp: Date.now() });
        res.json(data);
    } catch (e) {
        console.error('Forex error:', e.message);
        res.status(500).json({ error: 'Failed to fetch forex data', details: e.message });
    }
});

// Precious metals endpoint - Gold and Silver per gram (mock data)
app.get('/api/precious-metals', async (req, res) => {
    try {
        const cacheKey = 'precious_metals';
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        // Mock precious metals data (using mock data due to Finnhub rate limits)
        const GRAMS_PER_OUNCE = 31.1035;

        // Base prices with small random variation
        const goldPricePerOunce = 2040 + (Math.random() - 0.5) * 40; // $2020-2060
        const silverPricePerOunce = 24.5 + (Math.random() - 0.5) * 1; // $24-25

        const goldPricePerGram = goldPricePerOunce / GRAMS_PER_OUNCE;
        const silverPricePerGram = silverPricePerOunce / GRAMS_PER_OUNCE;

        const goldChange = (Math.random() - 0.5) * 3; // ±1.5% change
        const silverChange = (Math.random() - 0.5) * 4; // ±2% change

        const data = [
            {
                name: 'Gold',
                symbol: 'XAU',
                pricePerGram: parseFloat(goldPricePerGram.toFixed(2)),
                pricePerOunce: parseFloat(goldPricePerOunce.toFixed(2)),
                change: parseFloat(goldChange.toFixed(2))
            },
            {
                name: 'Silver',
                symbol: 'XAG',
                pricePerGram: parseFloat(silverPricePerGram.toFixed(2)),
                pricePerOunce: parseFloat(silverPricePerOunce.toFixed(2)),
                change: parseFloat(silverChange.toFixed(2))
            }
        ];

        cache.set(cacheKey, { data: data, timestamp: Date.now() });
        res.json(data);
    } catch (e) {
        console.error('Precious metals error:', e.message);
        res.status(500).json({ error: 'Failed to fetch precious metals data', details: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server active on port ${PORT}`));
