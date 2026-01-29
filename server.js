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
    lastUpdate: 0
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
    // Expanded Stock List - Max Coverage
    stocks: [
        'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NFLX', 'AMD', 'INTC', // Tech
        'JPM', 'BAC', 'V', 'MA', 'GS', 'MS', 'WFC', 'C', // Finance
        'WMT', 'TGT', 'COST', 'NKE', 'SBUX', 'MCD', 'KO', 'PEP', 'PG', // Retail/Consumer
        'XOM', 'CVX', 'GE', 'CAT', 'BA', 'F', 'GM', // Industrial/Energy
        'PFE', 'JNJ', 'MRK', 'ABBV', 'LLY', 'UNH', // Healthcare
        'DIS', 'CMCSA', 'VZ', 'T' // Media/Telco
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
        'EUR/USD': 'OANDA:EUR_USD',
        'GBP/USD': 'OANDA:GBP_USD',
        'USD/JPY': 'OANDA:USD_JPY',
        'USD/CHF': 'OANDA:USD_CHF',
        'AUD/USD': 'OANDA:AUD_USD',
        'USD/CAD': 'OANDA:USD_CAD',
        'USD/CNY': 'OANDA:USD_CNY',
        'USD/TRY': 'OANDA:USD_TRY'
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

    // 1. Build the Unified Queue
    // We create a list of tasks. Each task is a function that fetches 1 asset.
    let taskQueue = [];

    const buildQueue = () => {
        const tasks = [];

        // Crypto Tasks
        Object.keys(CONFIG.cryptoMapping).forEach(id => {
            tasks.push(async () => {
                const map = CONFIG.cryptoMapping[id];
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${map.sym}&token=${FINNHUB_KEY}`, { timeout: 4000 });
                    if (r.data.c) {
                        const item = {
                            id: id,
                            symbol: map.short.toLowerCase(),
                            name: map.name,
                            current_price: smoothPrice(id, r.data.c),
                            price_change_percentage_24h: r.data.dp || 0
                        };
                        // Update specific item in cache
                        updateCache('crypto', item, 'id');
                    }
                } catch (e) { }
            });
        });

        // Stock Tasks
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

        // Commodity Tasks
        Object.entries(CONFIG.commoditySymbols).forEach(([name, sym]) => {
            tasks.push(async () => {
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 4000 });
                    if (r.data.c) {
                        const item = { name: name, price: r.data.c, change: r.data.dp || 0 };
                        updateCache('commodities-raw', item, 'name'); // Store raw for post-processing
                    }
                } catch (e) { }
            });
        });

        // Forex Tasks
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

    // Helper to update cache arrays safely
    const updateCache = (category, item, keyField) => {
        if (category === 'commodities-raw') {
            // Special handling for commodities (post-processed later)
            if (!CACHE_STORE.raw_commodities) CACHE_STORE.raw_commodities = {};
            CACHE_STORE.raw_commodities[item.name] = item;
            processCommodities(); // Trigger re-calc
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

    // Special Processor for Commodities (Conversions etc)
    const processCommodities = async () => {
        if (!CACHE_STORE.raw_commodities) return;

        // Static Info
        const GRAMS_PER_OUNCE = 31.1035;
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

        // Try to get Forex for conversions (rarely)
        let usdToTry = 42.5;
        let usdToUah = 41.5;
        // ... (Optional: fetch forex here occasionally or use cached forex)

        const processed = Object.keys(CACHE_STORE.raw_commodities).map(name => {
            const raw = CACHE_STORE.raw_commodities[name];
            const info = commodityInfo[name] || { unit: '', category: 'other' };

            let extra = {};
            if (name === 'Gold') {
                const pricePerGram = raw.price / GRAMS_PER_OUNCE;
                extra = { price_gram_try: pricePerGram * usdToTry, price_gram_uah: pricePerGram * usdToUah };
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

    // --- HOT START STRATEGY ---
    // Immediate "Burst" Fetch for Top Assets to populate UI instantly
    // We ignore rate limits for this one-time burst (cached budget)
    async function performHotStart() {
        console.log('🔥 Executing Hot Start...');
        const topCrypto = Object.keys(CONFIG.cryptoMapping).slice(0, 15);
        const topStocks = CONFIG.stocks.slice(0, 10);
        const topCommodities = Object.keys(CONFIG.commoditySymbols).slice(0, 5);

        // Parallel Burst
        await Promise.all([
            ...topCrypto.map(async id => {
                try {
                    const map = CONFIG.cryptoMapping[id];
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${map.sym}&token=${FINNHUB_KEY}`, { timeout: 3000 });
                    if (r.data.c) updateCache('crypto', { id, symbol: map.short.toLowerCase(), name: map.name, current_price: r.data.c, price_change_percentage_24h: r.data.dp }, 'id');
                } catch (e) { }
            }),
            ...topStocks.map(async sym => {
                try {
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 3000 });
                    if (r.data.c) updateCache('stocks', { symbol: sym, price: r.data.c, change: r.data.dp }, 'symbol');
                } catch (e) { }
            }),
            ...topCommodities.map(async name => {
                try {
                    const sym = CONFIG.commoditySymbols[name];
                    const r = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 3000 });
                    if (r.data.c) updateCache('commodities-raw', { name, price: r.data.c, change: r.data.dp }, 'name');
                } catch (e) { }
            })
        ]);
        console.log('🔥 Hot Start Complete - UI Populated');
    }

    // 2. Execution Loop
    // Start Hot Start first, then loop
    await performHotStart();

    // We execute one task every X ms
    taskQueue = buildQueue();
    let taskIndex = 0;

    const executeNext = async () => {
        if (taskQueue.length === 0) taskQueue = buildQueue();

        if (taskIndex >= taskQueue.length) {
            taskIndex = 0;
            // Optional: Re-shuffle or re-build queue periodically?
            // For now, just loop.
        }

        const task = taskQueue[taskIndex];
        if (task) await task(); // Execute fetch

        taskIndex++;
        // 800ms delay to be safe
        setTimeout(executeNext, 800);
    };

    executeNext(); // Start loop
}

// Start Sequential Engine
// Wait a bit for server start
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
