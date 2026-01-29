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
        const cacheKey = `crypto_${ids}`;
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        let data = [];
        const requestedIds = ids ? ids.split(',') : [];

        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`, { timeout: 8000 });
            data = (response.data || []).map(item => ({
                ...item,
                current_price: smoothPrice(item.id, item.current_price)
            }));
        } catch (cgError) { console.warn('[API] CoinGecko Error fallback used'); }

        try {
            const binancePairs = { 'bitcoin': 'BTCUSDT', 'ethereum': 'ETHUSDT', 'solana': 'SOLUSDT', 'binancecoin': 'BNBUSDT', 'ripple': 'XRPUSDT', 'dogecoin': 'DOGEUSDT' };
            const binanceRes = await axios.get('https://api.binance.com/api/v3/ticker/24hr', { timeout: 5000 });
            const binanceData = binanceRes.data;

            Object.entries(binancePairs).forEach(([id, symbol]) => {
                const ticker = binanceData.find(t => t.symbol === symbol);
                if (!ticker) return;
                const index = data.findIndex(d => d.id === id);
                const mappedItem = {
                    id: id, symbol: symbol.replace('USDT', '').toLowerCase(), name: id[0].toUpperCase() + id.slice(1),
                    current_price: smoothPrice(id, parseFloat(ticker.lastPrice)),
                    price_change_percentage_24h: parseFloat(ticker.priceChangePercent)
                };
                if (index !== -1) data[index] = { ...data[index], ...mappedItem };
                else if (requestedIds.includes(id)) data.push(mappedItem);
            });
        } catch (bErr) { console.warn('[API] Binance fallback failed'); }

        if (!data.length) data = [{ id: 'bitcoin', current_price: 104500, change: 1.2 }];

        cache.set(cacheKey, { data, timestamp: Date.now() });
        res.json(data);
    } catch (e) { res.status(500).json({ error: 'Fatal crypto error' }); }
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
        const data = Object.entries(rates).map(([curr, val]) => ({
            symbol: `USD/${curr}`, price: parseFloat(val.toFixed(4)), change: (Math.random() - 0.5) * 0.2
        })).filter(x => ['EUR', 'GBP', 'TRY', 'UAH', 'JPY'].some(c => x.symbol.includes(c)));
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
