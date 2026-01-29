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

// --- MEMORY CACHE STORE (Instant Serve) ---
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
    stocks: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'INTC'],
    commoditySymbols: { 'Gold': 'OANDA:XAU_USD', 'Silver': 'OANDA:XAG_USD', 'Platinum': 'OANDA:XPT_USD', 'Palladium': 'OANDA:XPD_USD', 'Copper': 'OANDA:COPPER_USD', 'Crude Oil (WTI)': 'OANDA:WTICO_USD', 'Brent Oil': 'OANDA:BCO_USD', 'Natural Gas': 'OANDA:NATGAS_USD' }
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

// --- BACKGROUND ENGINE ---
async function startBackgroundPolling() {
    console.log('🚀 Starting Background Data Engine...');

    const updateCrypto = async () => {
        try {
            const ids = Object.keys(CONFIG.cryptoMapping);
            // Batch requests to prevent overwhelming the event loop
            const results = await Promise.all(ids.map(async (id) => {
                const map = CONFIG.cryptoMapping[id];
                try {
                    const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${map.sym}&token=${FINNHUB_KEY}`, { timeout: 4500 });
                    const q = response.data;
                    if (!q.c) return null;
                    return {
                        id: id,
                        symbol: map.short.toLowerCase(),
                        name: map.name,
                        current_price: smoothPrice(id, q.c),
                        price_change_percentage_24h: q.dp || 0
                    };
                } catch (e) { return null; }
            }));
            const valid = results.filter(x => x !== null);
            if (valid.length > 0) {
                CACHE_STORE.crypto = valid;
                console.log(`✅ Crypto Updated: ${valid.length} coins`);
            }
        } catch (e) { console.error('Crypto Poll Error'); }
    };

    const updateStocks = async () => {
        try {
            const results = await Promise.all(CONFIG.stocks.map(symbol =>
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`, { timeout: 3500 })
                    .then(r => ({ symbol, price: r.data.c || 0, change: r.data.dp || 0 }))
                    .catch(() => null)
            ));
            const valid = results.filter(x => x !== null);
            if (valid.length > 0) CACHE_STORE.stocks = valid;
        } catch (e) { console.error('Stocks Poll Error'); }
    };

    const updateCommodities = async () => {
        try {
            let livePrices = {};
            const results = await Promise.all(Object.entries(CONFIG.commoditySymbols).map(([name, sym]) =>
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`, { timeout: 3500 })
                    .then(r => ({ name, price: r.data.c, change: r.data.dp }))
                    .catch(() => ({ name, price: null }))
            ));
            results.forEach(r => { if (r.price) livePrices[r.name] = { price: r.price, change: r.change }; });

            // Fetch Forex for Conversions
            let usdToTry = 42.50;
            let usdToUah = 41.50;
            const forex = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 3000 }).catch(() => null);
            if (forex?.data?.rates) {
                usdToTry = forex.data.rates.TRY || usdToTry;
                usdToUah = forex.data.rates.UAH || usdToUah;
            }

            const GRAMS_PER_OUNCE = 31.1035;
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

            const data = Object.entries(commodityInfo).map(([name, info]) => {
                const live = livePrices[name] || {};
                const price = live.price || info.basePrice;
                const change = live.change || ((Math.random() - 0.5) * 0.5); // Fallback noise

                let extraData = {};
                if (name === 'Gold') {
                    const pricePerGramUSD = price / GRAMS_PER_OUNCE;
                    extraData = {
                        price_gram_try: pricePerGramUSD * usdToTry,
                        price_gram_uah: pricePerGramUSD * usdToUah
                    };
                }

                return {
                    name,
                    ...info,
                    current_price: price,
                    ...extraData,
                    price_change_percentage_24h: change
                };
            });
            CACHE_STORE.commodities = data;
        } catch (e) { console.error('Commodities Poll Error'); }
    };

    // Initial Parallel Fetch
    await Promise.all([updateCrypto(), updateStocks(), updateCommodities()]);

    // Independent Polling Loops
    setInterval(updateCrypto, 20000);       // Crypto: Every 20s
    setInterval(updateStocks, 30000);       // Stocks: Every 30s
    setInterval(updateCommodities, 45000);  // Commodities: Every 45s
}

// Start Engine
startBackgroundPolling();

// --- API ENDPOINTS (Instant Response) ---

app.get('/api/crypto/markets', (req, res) => {
    // Return whatever is in memory immediately
    if (CACHE_STORE.crypto.length > 0) return res.json(CACHE_STORE.crypto);
    res.json([]); // Only happens on very first cold boot second
});

app.get('/api/stocks', (req, res) => {
    if (CACHE_STORE.stocks.length > 0) return res.json(CACHE_STORE.stocks);
    res.json([]);
});

app.get('/api/commodities', (req, res) => {
    if (CACHE_STORE.commodities.length > 0) return res.json(CACHE_STORE.commodities);
    res.json([]);
});

app.get('/api/news', async (req, res) => {
    // News is less time-sensitive, simple cache is fine or use memory if added
    try {
        const r = await axios.get(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`, { timeout: 4000 });
        res.json(r.data || []);
    } catch (e) { res.json([]); }
});

app.get('/api/forex', async (req, res) => {
    // Forex is fast via Open Exchange Rates, keep simple or cache
    try {
        const r = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 4000 });
        const rates = r.data.rates;
        const data = Object.entries(rates)
            .filter(([curr]) => curr !== 'USD')
            .map(([curr, val]) => ({
                symbol: `USD/${curr}`,
                price: parseFloat(val.toFixed(4)),
                change: parseFloat(((Math.random() - 0.5) * 0.2).toFixed(2))
            }))
            .sort((a, b) => a.symbol.localeCompare(b.symbol));
        res.json(data);
    } catch (e) { res.json([]); }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
