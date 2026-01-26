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

        // Standard forex symbols for Finnhub
        const symbols = ['FX:EURUSD', 'FX:GBPUSD', 'FX:USDJPY', 'FX:USDTRY', 'FX:EURTRY'];

        const promises = symbols.map(s =>
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${FINNHUB_KEY}`)
        );

        const responses = await Promise.all(promises);
        const data = responses.map((r, i) => {
            const sym = symbols[i].replace('FX:', '');
            // Convert EURUSD to EUR/USD
            const displaySym = sym.slice(0, 3) + '/' + sym.slice(3);
            return {
                symbol: displaySym,
                price: r.data.c || 0,
                change: r.data.dp || 0
            };
        }).filter(item => item.price > 0); // Only return valid data

        cache.set(cacheKey, { data: data, timestamp: Date.now() });
        res.json(data);
    } catch (e) {
        console.error('Forex error:', e.message);
        res.json([]);
    }
});

// Precious metals endpoint - Gold and Silver per gram
app.get('/api/precious-metals', async (req, res) => {
    try {
        const cacheKey = 'precious_metals';
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        // Fetch gold and silver prices (per ounce from Finnhub, convert to grams)
        const goldSymbol = 'OANDA:XAU_USD'; // Gold per ounce
        const silverSymbol = 'OANDA:XAG_USD'; // Silver per ounce

        const [goldRes, silverRes] = await Promise.all([
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${goldSymbol}&token=${FINNHUB_KEY}`),
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${silverSymbol}&token=${FINNHUB_KEY}`)
        ]);

        // Convert from ounce to gram (1 troy ounce = 31.1035 grams)
        const GRAMS_PER_OUNCE = 31.1035;
        const goldPricePerGram = goldRes.data.c / GRAMS_PER_OUNCE;
        const silverPricePerGram = silverRes.data.c / GRAMS_PER_OUNCE;

        const data = [
            {
                name: 'Gold',
                symbol: 'XAU',
                pricePerGram: goldPricePerGram,
                pricePerOunce: goldRes.data.c,
                change: goldRes.data.dp || 0
            },
            {
                name: 'Silver',
                symbol: 'XAG',
                pricePerGram: silverPricePerGram,
                pricePerOunce: silverRes.data.c,
                change: silverRes.data.dp || 0
            }
        ];

        cache.set(cacheKey, { data: data, timestamp: Date.now() });
        res.json(data);
    } catch (e) {
        console.error('Precious metals error:', e.response ? e.response.data : e.message);
        res.status(500).json({ error: 'Failed to fetch precious metals data', details: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server active on port ${PORT}`));
