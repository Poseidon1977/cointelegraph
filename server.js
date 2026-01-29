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

// --- MEMORY CACHE STORE ---
const CACHE_STORE = {
    crypto: [],
    stocks: [],
    commodities: [],
    forex: [],
    news: [],
    lastUpdate: 0,
    raw_commodities: {}
};

// --- DATA CONFIGURATION ---
const CONFIG = {
    cryptoMapping: {
        'bitcoin': { sym: 'BINANCE:BTCUSDT', name: 'Bitcoin', short: 'BTC' },
        'ethereum': { sym: 'BINANCE:ETHUSDT', name: 'Ethereum', short: 'ETH' },
        'solana': { sym: 'BINANCE:SOLUSDT', name: 'Solana', short: 'SOL' },
        'binancecoin': { sym: 'BINANCE:BNBUSDT', name: 'BNB', short: 'BNB' },
        'ripple': { sym: 'BINANCE:XRPUSDT', name: 'XRP', short: 'XRP' },
        'cardano': { sym: 'BINANCE:ADAUSDT', name: 'Cardano', short: 'ADA' },
        'dogecoin': { sym: 'BINANCE:DOGEUSDT', name: 'Dogecoin', short: 'DOGE' },
        'polkadot': { sym: 'BINANCE:DOTUSDT', name: 'Polkadot', short: 'DOT' },
        'tron': { sym: 'BINANCE:TRXUSDT', name: 'TRON', short: 'TRX' },
        'chainlink': { sym: 'BINANCE:LINKUSDT', name: 'Chainlink', short: 'LINK' },
        'avalanche-2': { sym: 'BINANCE:AVAXUSDT', name: 'Avalanche', short: 'AVAX' },
        'shiba-inu': { sym: 'BINANCE:SHIBUSDT', name: 'Shiba Inu', short: 'SHIB' },
        'toncoin': { sym: 'BINANCE:TONUSDT', name: 'Toncoin', short: 'TON' },
        'stellar': { sym: 'BINANCE:XLMUSDT', name: 'Stellar', short: 'XLM' },
        'sui': { sym: 'BINANCE:SUIUSDT', name: 'Sui', short: 'SUI' },
        'litecoin': { sym: 'BINANCE:LTCUSDT', name: 'Litecoin', short: 'LTC' },
        'bitcoin-cash': { sym: 'BINANCE:BCHUSDT', name: 'Bitcoin Cash', short: 'BCH' },
        'near': { sym: 'BINANCE:NEARUSDT', name: 'NEAR', short: 'NEAR' },
        'aptos': { sym: 'BINANCE:APTUSDT', name: 'Aptos', short: 'APT' },
        'cosmos': { sym: 'BINANCE:ATOMUSDT', name: 'Cosmos', short: 'ATOM' },
        'fantom': { sym: 'BINANCE:FTMUSDT', name: 'Fantom', short: 'FTM' },
        'optimism': { sym: 'BINANCE:OPUSDT', name: 'Optimism', short: 'OP' },
        'arbitrum': { sym: 'BINANCE:ARBUSDT', name: 'Arbitrum', short: 'ARB' },
        'render-token': { sym: 'BINANCE:RENDERUSDT', name: 'Render', short: 'RENDER' },
        'internet-computer': { sym: 'BINANCE:ICPUSDT', name: 'ICP', short: 'ICP' },
        'uniswap': { sym: 'BINANCE:UNIUSDT', name: 'Uniswap', short: 'UNI' },
        'ethereum-classic': { sym: 'BINANCE:ETCUSDT', name: 'Eth Classic', short: 'ETC' },
        'pepe': { sym: 'BINANCE:PEPEUSDT', name: 'Pepe', short: 'PEPE' },
        'bonk': { sym: 'BINANCE:BONKUSDT', name: 'Bonk', short: 'BONK' },
        'floki': { sym: 'BINANCE:FLOKIUSDT', name: 'Floki', short: 'FLOKI' },
        'sei-network': { sym: 'BINANCE:SEIUSDT', name: 'Sei', short: 'SEI' },
        'celestia': { sym: 'BINANCE:TIAUSDT', name: 'Celestia', short: 'TIA' },
        'monero': { sym: 'BINANCE:XMRUSDT', name: 'Monero', short: 'XMR' },
        'okb': { sym: 'OKX:OKB-USDT', name: 'OKB', short: 'OKB' },
        'kaspa': { sym: 'MEXC:KASPUSDT', name: 'Kaspa', short: 'KAS' }
    },
    stocks: [
        'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NFLX', 'AMD', 'INTC',
        'JPM', 'BAC', 'V', 'MA', 'GS', 'MS', 'WFC', 'C',
        'WMT', 'TGT', 'COST', 'NKE', 'SBUX', 'MCD', 'KO', 'PEP', 'PG',
        'XOM', 'CVX', 'GE', 'CAT', 'BA', 'F', 'GM',
        'PFE', 'JNJ', 'MRK', 'ABBV', 'LLY', 'UNH',
        'DIS', 'CMCSA', 'VZ', 'T'
    ],
    commoditySymbols: {
        'Gold': 'OANDA:XAU_USD',
        'Silver': 'OANDA:XAG_USD',
        'Platinum': 'OANDA:XPT_USD',
        'Palladium': 'OANDA:XPD_USD',
        'Copper': 'OANDA:COPPER_USD',
        'Crude Oil (WTI)': 'OANDA:WTICO_USD',
        'Brent Oil': 'OANDA:BCO_USD',
        'Natural Gas': 'OANDA:NATGAS_USD',
        'Wheat': 'OANDA:WHEAT_USD',
        'Corn': 'OANDA:CORN_USD',
        'Sugar': 'OANDA:SUGAR_USD'
    },
    forexSymbols: {
        // Majors
        'EUR/USD': 'OANDA:EUR_USD',
        'GBP/USD': 'OANDA:GBP_USD',
        'USD/JPY': 'OANDA:USD_JPY',
        'USD/CHF': 'OANDA:USD_CHF',
        'AUD/USD': 'OANDA:AUD_USD',
        'USD/CAD': 'OANDA:USD_CAD',
        // Global
        'USD/CNY': 'OANDA:USD_CNY',
        'USD/TRY': 'OANDA:USD_TRY',
        'USD/UAH': 'OANDA:USD_UAH',
        'USD/MXN': 'OANDA:USD_MXN',
        'USD/ZAR': 'OANDA:USD_ZAR',
        'USD/HKD': 'OANDA:USD_HKD',
        'USD/SGD': 'OANDA:USD_SGD',
        'USD/SEK': 'OANDA:USD_SEK',
        'USD/NOK': 'OANDA:USD_NOK',
        'NZD/USD': 'OANDA:NZD_USD',
        'USD/INR': 'OANDA:USD_INR',
        'USD/BRL': 'OANDA:USD_BRL'
    }
};

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

// --- SMART QUEUE ENGINE ---
async function startSmartQueue() {
    console.log('🚂 Starting Smart Sequential Queue...');

    // Helper to update cache arrays safely
    const updateCache = (category, item, keyField) => {
        if (category === 'commodities-raw') {
            if (!CACHE_STORE.raw_commodities) CACHE_STORE.raw_commodities = {};
            CACHE_STORE.raw_commodities[item.name] = item;
            processCommodities();
            return;
        }

        const list = CACHE_STORE[category];
        const index = list.findIndex(x => x[keyField] === item[keyField]);
        if (index >= 0) {
            list[index] = item;
        } else {
            list.push(item);
        }
    };

    const processCommodities = async () => {
        if (!CACHE_STORE.raw_commodities) return;

        const GRAMS_PER_OUNCE = 31.1034768; // Investing.com Precision
        const commodityInfo = {
            'Gold': { category: 'metals', unit: 'oz', basePrice: 2000 },
            'Silver': { category: 'metals', unit: 'oz', basePrice: 25 },
            'Platinum': { category: 'metals', unit: 'oz', basePrice: 900 },
            'Palladium': { category: 'metals', unit: 'oz', basePrice: 1000 },
            'Copper': { category: 'metals', unit: 'ton', basePrice: 8500 },
            'Crude Oil (WTI)': { category: 'energy', unit: 'barrel', basePrice: 75 },
            'Brent Oil': { category: 'energy', unit: 'barrel', basePrice: 80 },
            'Natural Gas': { category: 'energy', unit: 'MMBtu', basePrice: 2.5 },
            'Wheat': { category: 'agri', unit: 'bushel', basePrice: 6.0 },
            'Corn': { category: 'agri', unit: 'bushel', basePrice: 5.0 },
            'Sugar': { category: 'agri', unit: 'lb', basePrice: 0.2 }
        };

        // DYNAMIC RATES from Cache
        const tryRate = CACHE_STORE.forex.find(f => f.symbol === 'USD/TRY')?.price || 43.50;
        const uahRate = CACHE_STORE.forex.find(f => f.symbol === 'USD/UAH')?.price || 42.00;

        const processed = Object.keys(CACHE_STORE.raw_commodities).map(name => {
            const raw = CACHE_STORE.raw_commodities[name];
            const info = commodityInfo[name] || { unit: '', category: 'other' };

            let extra = {};
            if (name === 'Gold') {
                const pricePerGram = raw.price / GRAMS_PER_OUNCE;
                extra = {
                    pricePerGramTRY: pricePerGram * tryRate,
                    pricePerGramUAH: pricePerGram * uahRate
                };
            }

            return {
                name,
                ...info,
                current_price: raw.price,
                price_change_percentage_24h: raw.change,
                ...extra
            };
        });

        CACHE_STORE.commodities = processed;
    };

    // --- SEED CACHE STRATEGY (Realistic Defaults) ---
    function seedCache() {
        console.log('🌱 Seeding Cache with Realistic Data...');

        const defaults = {
            'bitcoin': 96500, 'ethereum': 3500, 'solana': 148, 'binancecoin': 605,
            'ripple': 2.45, 'cardano': 0.85, 'dogecoin': 0.35, 'polkadot': 7.50
        };

        // Seed Crypto
        Object.keys(CONFIG.cryptoMapping).forEach(id => {
            const map = CONFIG.cryptoMapping[id];
            const price = defaults[id] || 15.00;
            updateCache('crypto', { id, symbol: map.short.toLowerCase(), name: map.name, current_price: price, price_change_percentage_24h: 0.1 }, 'id');
        });

        // Seed Stocks
        CONFIG.stocks.forEach(sym => {
            updateCache('stocks', { symbol: sym, price: 215.00, change: 0.5 }, 'symbol');
        });

        // 1. SEED FOREX FIRST (Crucial for Gold calculations)
        Object.keys(CONFIG.forexSymbols).forEach(name => {
            let p = 1.00;
            if (name === 'EUR/USD') p = 1.0850;
            if (name === 'GBP/USD') p = 1.2720;
            if (name === 'USD/JPY') p = 155.00;
            if (name === 'USD/CHF') p = 0.8850;
            if (name === 'AUD/USD') p = 0.6540;
            if (name === 'USD/CAD') p = 1.3850;
            if (name === 'USD/CNY') p = 7.25;
            if (name === 'USD/TRY') p = 43.50; // Calibrated 2026 Rate
            if (name === 'USD/UAH') p = 42.00;
            if (name === 'USD/MXN') p = 20.10;
            if (name === 'USD/ZAR') p = 18.50;
            if (name === 'USD/HKD') p = 7.82;
            if (name === 'USD/SGD') p = 1.35;
            if (name === 'USD/SEK') p = 10.50;
            if (name === 'USD/NOK') p = 10.80;
            if (name === 'NZD/USD') p = 0.6050;
            if (name === 'USD/INR') p = 84.00;
            if (name === 'USD/BRL') p = 5.85;
            updateCache('forex', { symbol: name, price: p, change: 0.1 }, 'symbol');
        });

        // 2. SEED COMMODITIES (Now has access to Forex rates)
        Object.keys(CONFIG.commoditySymbols).forEach(name => {
            let p = 50.00;
            if (name === 'Gold') p = 5150; // 2026 Projection
            if (name === 'Silver') p = 55.50;
            if (name === 'Crude Oil (WTI)') p = 85.00;
            updateCache('commodities-raw', { name, price: p, change: 0.2 }, 'name');
        });

        console.log('🌱 Cache Seeded.');
    }

    // --- EXECUTION START ---
    seedCache();

    // --- HOT START STRATEGY ---
    async function performHotStart() {
        console.log('🔥 Executing Safe Hot Start...');
        const topCrypto = Object.keys(CONFIG.cryptoMapping).slice(0, 5);
        const topStocks = CONFIG.stocks.slice(0, 3);
        const topCommodities = ['Gold', 'Crude Oil (WTI)'];

        await Promise.all([
            ...topCrypto.map(async id => {
                try {
                    const map = CONFIG.cryptoMapping[id];
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${map.sym}&token=${FINNHUB_KEY}`, { timeout: 3500 });
                    if (r.data.c) updateCache('crypto', { id, symbol: map.short.toLowerCase(), name: map.name, current_price: r.data.c, price_change_percentage_24h: r.data.dp }, 'id');
                } catch (e) { }
            }),
            ...topStocks.map(async sym => {
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 3500 });
                    if (r.data.c) updateCache('stocks', { symbol: sym, price: r.data.c, change: r.data.dp }, 'symbol');
                } catch (e) { }
            }),
            ...topCommodities.map(async name => {
                try {
                    const sym = CONFIG.commoditySymbols[name];
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 3500 });
                    if (r.data.c) updateCache('commodities-raw', { name, price: r.data.c, change: r.data.dp }, 'name');
                } catch (e) { }
            })
        ]);
        console.log('✅ Safe Hot Start Complete.');
    }

    await performHotStart();

    // 3. Queue Loop
    let taskQueue = [];
    const buildQueue = () => {
        const tasks = [];
        Object.keys(CONFIG.cryptoMapping).forEach(id => {
            tasks.push(async () => {
                const map = CONFIG.cryptoMapping[id];
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${map.sym}&token=${FINNHUB_KEY}`, { timeout: 4000 });
                    if (r.data.c) {
                        const item = { id, symbol: map.short.toLowerCase(), name: map.name, current_price: r.data.c, price_change_percentage_24h: r.data.dp };
                        updateCache('crypto', item, 'id');
                    }
                } catch (e) { }
            });
        });
        CONFIG.stocks.forEach(sym => {
            tasks.push(async () => {
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 4000 });
                    if (r.data.c) {
                        const item = { symbol: sym, price: r.data.c, change: r.data.dp || 0 };
                        updateCache('stocks', item, 'symbol');
                    }
                } catch (e) { }
            });
        });
        Object.entries(CONFIG.commoditySymbols).forEach(([name, sym]) => {
            tasks.push(async () => {
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 4000 });
                    if (r.data.c) {
                        const item = { name: name, price: r.data.c, change: r.data.dp || 0 };
                        updateCache('commodities-raw', item, 'name');
                    }
                } catch (e) { }
            });
        });
        Object.entries(CONFIG.forexSymbols).forEach(([name, sym]) => {
            tasks.push(async () => {
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 4000 });
                    if (r.data.c) {
                        const item = { symbol: name, price: r.data.c, change: r.data.dp || 0 };
                        updateCache('forex', item, 'symbol');
                    }
                } catch (e) { }
            });
        });
        return tasks;
    };

    taskQueue = buildQueue();
    let taskIndex = 0;

    const executeNext = async () => {
        if (taskQueue.length === 0) taskQueue = buildQueue();
        if (taskIndex >= taskQueue.length) taskIndex = 0;
        const task = taskQueue[taskIndex];
        if (task) await task();
        taskIndex++;
        setTimeout(executeNext, 800);
    };

    executeNext(); // Start loop
}

setTimeout(startSmartQueue, 1000);

// --- API ENDPOINTS ---

app.get('/api/crypto/markets', (req, res) => {
    if (CACHE_STORE.crypto.length > 0) return res.json(CACHE_STORE.crypto);
    res.json([]);
});

app.get('/api/stocks', (req, res) => {
    if (CACHE_STORE.stocks.length > 0) return res.json(CACHE_STORE.stocks);
    res.json([]);
});

app.get('/api/commodities', (req, res) => {
    if (CACHE_STORE.commodities.length > 0) return res.json(CACHE_STORE.commodities);
    res.json([]);
});

app.get('/api/forex', (req, res) => {
    if (CACHE_STORE.forex.length > 0) return res.json(CACHE_STORE.forex);
    res.json([]);
});

app.get('/api/news', async (req, res) => {
    try {
        const r = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`, { timeout: 4000 });
        res.json(r.data || []);
    } catch (e) { res.json([]); }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
