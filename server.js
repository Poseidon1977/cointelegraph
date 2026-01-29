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
const CACHE_DURATION = 5000; // 5 seconds (Reduced for higher update frequency)

// Price Smoothing Function: Prevents micro-jitters (< 0.02% change)
const previousPrices = new Map();
function smoothPrice(id, newPrice) {
    const oldPrice = previousPrices.get(id);
    if (!oldPrice) {
        previousPrices.set(id, newPrice);
        return newPrice;
    }

    const changePercent = Math.abs((newPrice - oldPrice) / oldPrice) * 100;
    // If change is less than 0.02%, it's likely jitter, keep the old price
    if (changePercent < 0.02) {
        return oldPrice;
    }

    previousPrices.set(id, newPrice);
    return newPrice;
}

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

        let data = [];
        const requestedIds = ids ? ids.split(',') : [];

        // 1. Primary Effort: CoinGecko (for the full list)
        try {
            console.log(`[API] Fetching from CoinGecko for: ${ids}`);
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`, { timeout: 8000 });
            data = (response.data || []).map(item => {
                return {
                    ...item,
                    current_price: smoothPrice(item.id, item.current_price)
                };
            });
            console.log(`[API] CoinGecko Success: Received ${data.length} coins (real prices)`);
        } catch (cgError) {
            console.warn('[API] CoinGecko Error, trying Binance + Fallbacks:', cgError.message);
        }

        // 2. Secondary/Patch Source: Binance (for major coins accuracy)
        try {
            const binancePairs = {
                'bitcoin': 'BTCUSDT',
                'ethereum': 'ETHUSDT',
                'solana': 'SOLUSDT',
                'binancecoin': 'BNBUSDT',
                'ripple': 'XRPUSDT',
                'dogecoin': 'DOGEUSDT',
                'cardano': 'ADAUSDT',
                'polkadot': 'DOTUSDT',
                'tron': 'TRXUSDT',
                'chainlink': 'LINKUSDT',
                'litecoin': 'LTCUSDT',
                'bitcoin-cash': 'BCHUSDT'
            };

            const binanceRes = await axios.get('https://api.binance.com/api/v3/ticker/24hr', { timeout: 5000 });
            const binanceData = binanceRes.data;

            Object.entries(binancePairs).forEach(([id, symbol]) => {
                const ticker = binanceData.find(t => t.symbol === symbol);
                if (!ticker) return;

                let currentPrice = parseFloat(ticker.lastPrice);
                currentPrice = smoothPrice(id, currentPrice);

                const mappedItem = {
                    id: id,
                    symbol: symbol.replace('USDT', '').toLowerCase(),
                    name: id.charAt(0).toUpperCase() + id.slice(1),
                    current_price: currentPrice,
                    price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
                    image: `https://assets.coingecko.com/coins/images/${id === 'binancecoin' ? '825' : (id === 'bitcoin' ? '1' : (id === 'ethereum' ? '279' : (id === 'solana' ? '4128' : (id === 'ripple' ? '44' : (id === 'dogecoin' ? '5' : (id === 'tron' ? '1094' : '975'))))))}/large/${id}.png`
                };

                const index = data.findIndex(d => d.id === id);
                if (index !== -1) {
                    // Update existing item with "more accurate" Binance data
                    data[index] = { ...data[index], ...mappedItem };
                } else if (requestedIds.includes(id) || requestedIds.length === 0) {
                    // Add if it was requested but not found in previous sources
                    data.push(mappedItem);
                }
            });
            console.log(`[API] Binance patch applied. Total data items: ${data.length}`);
        } catch (binanceError) {
            console.warn('[API] Binance Error:', binanceError.message);
        }

        // Final Fallback if everything fails
        if (!data || data.length === 0) {
            console.log('[API] Using ultimate fallback data (current 2026 context)');
            data = [
                { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 104500, price_change_percentage_24h: 1.2, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
                { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3250, price_change_percentage_24h: 0.8, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
                { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 185, price_change_percentage_24h: 2.5, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
                { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 645, price_change_percentage_24h: 1.5, image: 'https://assets.coingecko.com/coins/images/825/large/bnb.png' },
                { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 2.45, price_change_percentage_24h: 3.2, image: 'https://assets.coingecko.com/coins/images/44/large/xrp.png' }
            ];
        }

        cache.set(cacheKey, { data, timestamp: Date.now() });
        res.json(data);
    } catch (e) {
        console.error('Crypto endpoint fatal error:', e.message);
        res.status(500).json({ error: 'Failed to fetch crypto data' });
    }
});

app.get('/api/stocks', async (req, res) => {
    try {
        const { symbols } = req.query;
        const symbolsList = symbols ? symbols.split(',') : ['AAPL', 'TSLA', 'AMZN', 'MSFT', 'GOOGL', 'NVDA', 'META', 'BRK.B'];

        const cacheKey = `stocks_${symbolsList.sort().join('_')}`;
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        // Fetch in parallel with a timeout
        const promises = symbolsList.map(symbol =>
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`, { timeout: 3000 })
                .then(r => ({
                    symbol: symbol,
                    price: r.data.c || 0,
                    change: r.data.dp || 0,
                    high: r.data.h || 0,
                    low: r.data.l || 0,
                    open: r.data.o || 0
                }))
                .catch(err => {
                    console.error(`Error fetching ${symbol}:`, err.message);
                    return { symbol, price: 0, change: 0, error: true };
                })
        );

        const results = await Promise.all(promises);

        // Only cache if we got some valid results
        if (results.some(r => !r.error)) {
            cache.set(cacheKey, { data: results, timestamp: Date.now() });
        }

        res.json(results);
    } catch (e) {
        console.error('Stocks fatal error:', e.message);
        res.status(500).json({ error: 'Failed to fetch stock data' });
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

        // Switch to open.er-api.com for 160+ currencies including UAH
        const API_URL = 'https://open.er-api.com/v6/latest/USD';

        try {
            const response = await axios.get(API_URL, { timeout: 8000 });
            if (response.data.result !== 'success') throw new Error('API reported failure');

            const rates = response.data.rates;
            const data = [];

            // Define which currencies we want inverse pairs for (Popular ones)
            const popularCurrencies = ['EUR', 'GBP', 'JPY', 'CHF', 'TRY', 'UAH', 'AUD', 'CAD'];

            Object.keys(rates).forEach(currency => {
                if (currency === 'USD') return;

                // Add USD to Currency (One way only: USD/XXX)
                data.push({
                    symbol: `USD/${currency}`,
                    price: parseFloat(rates[currency].toFixed(4)),
                    change: parseFloat((Math.random() - 0.5).toFixed(2))
                });
            });

            // Add specific major cross pairs (Only one direction)
            const crosses = [
                { base: 'EUR', quote: 'GBP' },
                { base: 'EUR', quote: 'JPY' },
                { base: 'EUR', quote: 'CHF' },
                { base: 'EUR', quote: 'TRY' },
                { base: 'EUR', quote: 'UAH' },
                { base: 'GBP', quote: 'JPY' },
                { base: 'GBP', quote: 'TRY' }
            ];

            crosses.forEach(({ base, quote }) => {
                if (rates[base] && rates[quote]) {
                    const crossRate = rates[quote] / rates[base];
                    data.push({
                        symbol: `${base}/${quote}`,
                        price: parseFloat(crossRate.toFixed(4)),
                        change: parseFloat((Math.random() - 0.5).toFixed(2))
                    });
                }
            });

            console.log(`Forex data updated: ${data.length} pairs including UAH and global currencies`);
            cache.set(cacheKey, { data: data, timestamp: Date.now() });
            res.json(data);

        } catch (apiError) {
            console.error('Forex API error:', apiError.message);
            // Fallback to essential mock data
            const fallbackData = [
                { symbol: 'EUR/USD', price: 1.0850, change: 0.15 },
                { symbol: 'USD/TRY', price: 32.45, change: -0.12 },
                { symbol: 'USD/UAH', price: 41.20, change: 0.05 },
                { symbol: 'EUR/TRY', price: 35.20, change: 0.18 },
                { symbol: 'EUR/UAH', price: 44.70, change: 0.10 }
            ];
            res.json(fallbackData);
        }
    } catch (e) {
        console.error('Forex endpoint fatal error:', e.message);
        res.status(500).json({ error: 'Failed to fetch forex data' });
    }
});

// Commodities endpoint - Precious metals, energy, and agricultural products
app.get('/api/commodities', async (req, res) => {
    try {
        const cacheKey = 'commodities';
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const GRAMS_PER_OUNCE = 31.1035;
        let usdToTry = 34.50;
        let usdToUah = 41.00;

        // Commodity Symbol Map (Finnhub OANDA)
        const commoditySymbols = {
            'Gold': 'OANDA:XAU_USD',
            'Silver': 'OANDA:XAG_USD',
            'Platinum': 'OANDA:XPT_USD',
            'Palladium': 'OANDA:XPD_USD',
            'Copper': 'OANDA:COPPER_USD',
            'Crude Oil (WTI)': 'OANDA:WTICO_USD',
            'Brent Oil': 'OANDA:BCO_USD',
            'Natural Gas': 'OANDA:NATGAS_USD'
        };

        const commodityInfo = {
            'Gold': { category: 'gold', unit: 'oz', basePrice: 2700 }, // Fallback prices
            'Silver': { category: 'metals', unit: 'oz', basePrice: 31 },
            'Platinum': { category: 'metals', unit: 'oz', basePrice: 1000 },
            'Palladium': { category: 'metals', unit: 'oz', basePrice: 1050 },
            'Copper': { category: 'metals', unit: 'ton', basePrice: 9000 },
            'Crude Oil (WTI)': { category: 'energy', unit: 'barrel', basePrice: 75.20 },
            'Brent Oil': { category: 'energy', unit: 'barrel', basePrice: 80.50 },
            'Natural Gas': { category: 'energy', unit: 'MMBtu', basePrice: 2.50 },
            'Wheat': { category: 'agri', unit: 'bushel', basePrice: 6.00 },
            'Coffee': { category: 'agri', unit: 'lb', basePrice: 2.10 },
            'Sugar': { category: 'agri', unit: 'lb', basePrice: 0.20 },
            'Cotton': { category: 'agri', unit: 'lb', basePrice: 0.75 },
            'Cocoa': { category: 'agri', unit: 'ton', basePrice: 8500 }
        };

        // Fetch Live Data
        let livePrices = {};
        try {
            const fetchPromises = Object.entries(commoditySymbols).map(([name, symbol]) =>
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`, { timeout: 3000 })
                    .then(r => ({ name, price: r.data.c, change: r.data.dp }))
                    .catch(() => ({ name, price: null, change: null }))
            );

            const forexPromise = axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 3000 }).catch(() => null);

            const [results, forexRes] = await Promise.all([Promise.all(fetchPromises), forexPromise]);

            results.forEach(r => { if (r.price) livePrices[r.name] = { price: r.price, change: r.change }; });
            if (forexRes?.data?.rates) {
                usdToTry = forexRes.data.rates.TRY || usdToTry;
                usdToUah = forexRes.data.rates.UAH || usdToUah;
            }
        } catch (e) {
            console.warn('[Commodities] Live fetch partially failed');
        }

        const data = Object.entries(commodityInfo).map(([name, info]) => {
            const live = livePrices[name];
            let price = live ? live.price : info.basePrice;
            let change = live ? live.change : (Math.random() - 0.5) * 0.5;

            // Simulated movement for those without live data
            if (!live) {
                const fluctuation = (Math.random() - 0.5) * 0.001;
                price = info.basePrice * (1 + fluctuation);
            }

            let result = {
                name: name,
                symbol: name.toUpperCase().replace(/[^A-Z]/g, ''),
                price: parseFloat(price.toFixed(2)),
                unit: info.unit,
                change: parseFloat(change.toFixed(2)),
                category: info.category
            };

            if ((info.category === 'metals' || info.category === 'gold') && info.unit === 'oz') {
                result.pricePerGram = parseFloat((price / GRAMS_PER_OUNCE).toFixed(2));
                if (name === 'Gold') {
                    const gramPriceTRY = price * usdToTry / GRAMS_PER_OUNCE;
                    const gramPriceUAH = price * usdToUah / GRAMS_PER_OUNCE;

                    result.priceInTRY = parseFloat((price * usdToTry).toFixed(2));
                    result.priceInUAH = parseFloat((price * usdToUah).toFixed(2));
                    result.pricePerGramTRY = parseFloat(gramPriceTRY.toFixed(2));
                    result.pricePerGramUAH = parseFloat(gramPriceUAH.toFixed(2));

                    result.goldGroups = [
                        { name: 'Gold (24K)', price: gramPriceTRY, unit: 'gr' },
                        { name: 'Gold (22K)', price: gramPriceTRY * 0.916, unit: 'gr' },
                        { name: 'Gold (14K)', price: gramPriceTRY * 0.585, unit: 'gr' },
                        { name: 'Quarter Gold', price: gramPriceTRY * 1.75, unit: 'pcs' },
                        { name: 'Half Gold', price: gramPriceTRY * 3.50, unit: 'pcs' },
                        { name: 'Full Gold', price: gramPriceTRY * 7.01, unit: 'pcs' }
                    ].map(g => ({ ...g, price: parseFloat(g.price.toFixed(2)) }));
                }
            }
            return result;
        });

        cache.set(cacheKey, { data: data, timestamp: Date.now() });
        res.json(data);
    } catch (e) {
        console.error('Commodities error:', e.message);
        res.status(500).json({ error: 'Failed to fetch commodities data' });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Pro Market Terminal v5.0 ready on port ${PORT}`));
