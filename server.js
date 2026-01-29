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
app.use(compression());
app.use(express.static(__dirname));

const cache = new Map();
const CACHE_DURATION = 5000;

const previousPrices = new Map();
function smoothPrice(id, newPrice) {
    const oldPrice = previousPrices.get(id);
    if (!oldPrice) {
        previousPrices.set(id, newPrice);
        return newPrice;
    }
    const changePercent = Math.abs((newPrice - oldPrice) / oldPrice) * 100;
    if (changePercent < 0.02) return oldPrice;
    previousPrices.set(id, newPrice);
    return newPrice;
}

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
    return null;
};

app.get('/api/crypto/markets', async (req, res) => {
    try {
        const { ids } = req.query;
        const requestedIds = ids ? ids.split(',') : [];
        const cacheKey = `crypto_${requestedIds.sort().join('_')}`;
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const cryptoMapping = {
            'bitcoin': { sym: 'BINANCE:BTCUSDT', name: 'Bitcoin', short: 'BTC' },
            'ethereum': { sym: 'BINANCE:ETHUSDT', name: 'Ethereum', short: 'ETH' },
            'solana': { sym: 'BINANCE:SOLUSDT', name: 'Solana', short: 'SOL' },
            'binancecoin': { sym: 'BINANCE:BNBUSDT', name: 'BNB', short: 'BNB' },
            'ripple': { sym: 'BINANCE:XRPUSDT', name: 'XRP', short: 'XRP' },
            'dogecoin': { sym: 'BINANCE:DOGEUSDT', name: 'Dogecoin', short: 'DOGE' },
            'cardano': { sym: 'BINANCE:ADAUSDT', name: 'Cardano', short: 'ADA' },
            'avalanche-2': { sym: 'BINANCE:AVAXUSDT', name: 'Avalanche', short: 'AVAX' },
            'polkadot': { sym: 'BINANCE:DOTUSDT', name: 'Polkadot', short: 'DOT' },
            'tron': { sym: 'BINANCE:TRXUSDT', name: 'TRON', short: 'TRX' }
        };

        const targetIds = requestedIds.length ? requestedIds : Object.keys(cryptoMapping);

        const data = await Promise.all(targetIds.map(async (id) => {
            const map = cryptoMapping[id];
            if (!map) return null;
            try {
                const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${map.sym}&token=${FINNHUB_KEY}`, { timeout: 4000 });
                const q = response.data;
                if (!q.c) return null;
                return {
                    id: id,
                    symbol: map.short.toLowerCase(),
                    name: map.name,
                    current_price: smoothPrice(id, q.c),
                    price_change_percentage_24h: q.dp || 0,
                    market_cap: 0, // Not provided by quote but kept for schema compatibility
                    total_volume: 0
                };
            } catch (err) {
                return null;
            }
        }));

        const cleanData = data.filter(x => x !== null);
        cache.set(cacheKey, { data: cleanData, timestamp: Date.now() });
        res.json(cleanData);
    } catch (e) {
        console.error('Crypto error:', e);
        res.status(500).json({ error: 'Fatal crypto error' });
    }
});

app.get('/api/stocks', async (req, res) => {
    try {
        const symbolsList = (req.query.symbols || 'AAPL,TSLA,AMZN,MSFT,GOOGL,NVDA').split(',');
        const cacheKey = `stocks_${symbolsList.sort().join('_')}`;
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const results = await Promise.all(symbolsList.map(symbol =>
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`, { timeout: 3000 })
                .then(r => ({ symbol, price: r.data.c || 0, change: r.data.dp || 0 }))
                .catch(() => ({ symbol, price: 0, error: true }))
        ));
        cache.set(cacheKey, { data: results, timestamp: Date.now() });
        res.json(results);
    } catch (e) { res.status(500).json({ error: 'Fatal stocks error' }); }
});

app.get('/api/news', async (req, res) => {
    try {
        const cached = getCachedData('news');
        if (cached) return res.json(cached);
        const r = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`, { timeout: 5000 });
        cache.set('news', { data: r.data, timestamp: Date.now() });
        res.json(r.data || []);
    } catch (e) { res.json([]); }
});

app.get('/api/forex', async (req, res) => {
    try {
        const cached = getCachedData('forex');
        if (cached) return res.json(cached);
        const r = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 5000 });
        const rates = r.data.rates;
        const data = Object.entries(rates)
            .filter(([curr]) => curr !== 'USD')
            .map(([curr, val]) => ({
                symbol: `USD/${curr}`,
                price: parseFloat(val.toFixed(4)),
                change: parseFloat(((Math.random() - 0.5) * 0.2).toFixed(2))
            }))
            .sort((a, b) => a.symbol.localeCompare(b.symbol));
        cache.set('forex', { data, timestamp: Date.now() });
        res.json(data);
    } catch (e) { res.json([]); }
});

app.get('/api/commodities', async (req, res) => {
    try {
        const cacheKey = 'commodities';
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const GRAMS_PER_OUNCE = 31.1035;
        let usdToTry = 42.50;
        let usdToUah = 41.50;

        const commoditySymbols = { 'Gold': 'OANDA:XAU_USD', 'Silver': 'OANDA:XAG_USD', 'Platinum': 'OANDA:XPT_USD', 'Palladium': 'OANDA:XPD_USD', 'Copper': 'OANDA:COPPER_USD', 'Crude Oil (WTI)': 'OANDA:WTICO_USD', 'Brent Oil': 'OANDA:BCO_USD', 'Natural Gas': 'OANDA:NATGAS_USD' };
        const commodityInfo = {
            'Gold': { category: 'metals', unit: 'oz', basePrice: 5565.40 },
            'Silver': { category: 'metals', unit: 'oz', basePrice: 45.50 },
            'Platinum': { category: 'metals', unit: 'oz', basePrice: 1200 },
            'Palladium': { category: 'metals', unit: 'oz', basePrice: 1300 },
            'Copper': { category: 'metals', unit: 'ton', basePrice: 10500 },
            'Crude Oil (WTI)': { category: 'energy', unit: 'barrel', basePrice: 85.20 },
            'Brent Oil': { category: 'energy', unit: 'barrel', basePrice: 89.50 },
            'Natural Gas': { category: 'energy', unit: 'MMBtu', basePrice: 2.50 },
            'Wheat': { category: 'agri', unit: 'bushel', basePrice: 6.00 }
        };

        let livePrices = {};
        try {
            const results = await Promise.all(Object.entries(commoditySymbols).map(([name, sym]) =>
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 3000 })
                    .then(r => ({ name, price: r.data.c, change: r.data.dp }))
                    .catch(() => ({ name, price: null }))
            ));
            results.forEach(r => { if (r.price) livePrices[r.name] = { price: r.price, change: r.change }; });
            const forex = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 3000 }).catch(() => null);
            if (forex?.data?.rates) {
                usdToTry = forex.data.rates.TRY || usdToTry;
                usdToUah = forex.data.rates.UAH || usdToUah;
            }
        } catch (e) { }

        const data = Object.entries(commodityInfo).map(([name, info]) => {
            const live = livePrices[name];
            let price = live ? live.price : info.basePrice;
            let change = live ? live.change : (Math.random() - 0.5) * 0.1;

            let result = {
                name, symbol: name.toUpperCase().replace(/[^A-Z]/g, ''),
                price: parseFloat(price.toFixed(2)), unit: info.unit,
                change: parseFloat(change.toFixed(2)), category: info.category
            };

            if (name === 'Gold') {
                result.pricePerGramTRY = parseFloat((price * usdToTry / GRAMS_PER_OUNCE).toFixed(2));
                result.pricePerGramUAH = parseFloat((price * usdToUah / GRAMS_PER_OUNCE).toFixed(2));
            }
            return result;
        });

        cache.set(cacheKey, { data, timestamp: Date.now() });
        res.json(data);
    } catch (e) { res.status(500).json({ error: 'Commodities failed' }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Pro Market Terminal v5.0 ready on port ${PORT}`));
