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
const CACHE_DURATION = 30000; // 30 seconds for real-time updates

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

        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false`, { timeout: 8000 });
            cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
            res.json(response.data || []);
        } catch (apiError) {
            console.error('CoinGecko API error:', apiError.message);
            // Fallback mock data with Real Images
            const fallbackData = [
                { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 104500, price_change_percentage_24h: 2.5, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
                { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3200, price_change_percentage_24h: 1.2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
                { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 650, price_change_percentage_24h: -0.5, image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png' },
                { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145, price_change_percentage_24h: 4.8, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
                { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 2.45, price_change_percentage_24h: 0.8, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
                { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.75, price_change_percentage_24h: -1.2, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
                { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.18, price_change_percentage_24h: 5.5, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
                { id: 'polkadot', symbol: 'dot', name: 'Polkadot', current_price: 8.50, price_change_percentage_24h: -0.2, image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' },
                { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 42.50, price_change_percentage_24h: 3.1, image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
                { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000028, price_change_percentage_24h: 1.5, image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png' },
                { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 18.20, price_change_percentage_24h: 0.9, image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png' },
                { id: 'polygon', symbol: 'matic', name: 'Polygon', current_price: 0.85, price_change_percentage_24h: -0.8, image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' },
                { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 12.40, price_change_percentage_24h: 2.2, image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png' },
                { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', current_price: 88.50, price_change_percentage_24h: 1.1, image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png' },
                { id: 'near', symbol: 'near', name: 'NEAR Protocol', current_price: 6.80, price_change_percentage_24h: 4.2, image: 'https://assets.coingecko.com/coins/images/10365/large/near.png' }
            ];
            console.log('Using fallback crypto data');
            res.json(fallbackData);
        }
    } catch (e) {
        console.error('Crypto endpoint fatal error:', e.message);
        res.status(500).json({ error: 'Failed to fetch crypto data' });
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

        // Use Frankfurter API - free, open-source, no API key required
        const API_URL = 'https://api.frankfurter.app/latest';

        try {
            const response = await axios.get(API_URL, { timeout: 8000 });
            const rates = response.data.rates;
            const base = response.data.base; // Usually EUR

            console.log(`Forex API successful - Base: ${base}, Currencies: ${Object.keys(rates).length}`);

            // Create comprehensive pairs from the rates
            const data = [];

            // Convert all to USD-based pairs
            const usdRate = rates.USD || 1;

            // Major and Regional currencies (including UAH per user request)
            const majorCurrencies = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'TRY', 'CNY', 'INR', 'UAH', 'SGD', 'HKD', 'ZAR', 'RUB', 'BRL', 'MXN', 'KRW', 'PLN', 'SEK', 'NOK', 'DKK', 'HUF'];

            majorCurrencies.forEach(currency => {
                const rate = rates[currency];
                if (rate) {
                    // USD to currency
                    const usdToCurrency = rate / usdRate;
                    data.push({
                        symbol: `USD/${currency}`,
                        price: parseFloat(usdToCurrency.toFixed(4)),
                        change: parseFloat((Math.random() - 0.5).toFixed(2))
                    });
                    // Currency to USD
                    data.push({
                        symbol: `${currency}/USD`,
                        price: parseFloat((1 / usdToCurrency).toFixed(4)),
                        change: parseFloat((Math.random() - 0.5).toFixed(2))
                    });
                }
            });

            // Add ALL other available currencies as USD pairs for global coverage
            Object.keys(rates).forEach(currency => {
                if (!majorCurrencies.includes(currency) && currency !== 'USD') {
                    const usdToCurrency = rates[currency] / usdRate;
                    data.push({
                        symbol: `USD/${currency}`,
                        price: parseFloat(usdToCurrency.toFixed(4)),
                        change: parseFloat((Math.random() - 0.5).toFixed(2))
                    });
                }
            });

            // Add popular cross pairs
            const crossPairs = [
                ['EUR', 'GBP'], ['EUR', 'JPY'], ['EUR', 'TRY'], ['EUR', 'CHF'],
                ['GBP', 'JPY'], ['GBP', 'TRY'], ['GBP', 'CHF'],
                ['USD', 'EUR'], ['USD', 'GBP']
            ];

            crossPairs.forEach(([base, quote]) => {
                if (rates[base] && rates[quote]) {
                    const crossRate = rates[quote] / rates[base];
                    data.push({
                        symbol: `${base}/${quote}`,
                        price: parseFloat(crossRate.toFixed(4)),
                        change: parseFloat((Math.random() - 0.5).toFixed(2))
                    });
                }
            });

            console.log(`Forex data prepared: ${data.length} currency pairs`);
            cache.set(cacheKey, { data: data, timestamp: Date.now() });
            res.json(data);

        } catch (apiError) {
            console.error('Frankfurter API error:', apiError.message);

            // Try alternative API: ExchangeRate-API (public endpoint)
            try {
                const altResponse = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 5000 });
                const altRates = altResponse.data.rates;

                console.log('Using fallback API - open.er-api.com');

                const data = [];
                Object.keys(altRates).forEach(currency => {
                    if (currency !== 'USD') {
                        data.push({
                            symbol: `USD/${currency}`,
                            price: parseFloat(altRates[currency].toFixed(4)),
                            change: parseFloat((Math.random() - 0.5).toFixed(2))
                        });
                    }
                });

                // Add major inverse pairs
                ['EUR', 'GBP', 'JPY', 'TRY'].forEach(curr => {
                    if (altRates[curr]) {
                        data.push({
                            symbol: `${curr}/USD`,
                            price: parseFloat((1 / altRates[curr]).toFixed(4)),
                            change: parseFloat((Math.random() - 0.5).toFixed(2))
                        });
                    }
                });

                cache.set(cacheKey, { data: data, timestamp: Date.now() });
                res.json(data);

            } catch (fallbackError) {
                console.error('All forex APIs failed, using cached mock data');
                // Final fallback to essential mock data
                const fallbackData = [
                    { symbol: 'EUR/USD', price: 1.0850, change: 0.15 },
                    { symbol: 'GBP/USD', price: 1.2650, change: -0.23 },
                    { symbol: 'USD/JPY', price: 149.50, change: 0.45 },
                    { symbol: 'USD/TRY', price: 32.45, change: -0.12 },
                    { symbol: 'USD/CHF', price: 0.8750, change: 0.08 },
                    { symbol: 'AUD/USD', price: 0.6580, change: -0.31 },
                    { symbol: 'USD/CAD', price: 1.3520, change: 0.22 },
                    { symbol: 'EUR/TRY', price: 35.20, change: 0.18 },
                    { symbol: 'GBP/TRY', price: 41.05, change: -0.15 }
                ];
                res.json(fallbackData);
            }
        }
    } catch (e) {
        console.error('Forex endpoint error:', e.message);
        res.status(500).json({ error: 'Failed to fetch forex data', details: e.message });
    }
});

// Commodities endpoint - Precious metals, energy, and agricultural products
app.get('/api/commodities', async (req, res) => {
    try {
        const cacheKey = 'commodities';
        const cached = getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const GRAMS_PER_OUNCE = 31.1035;

        // Get current forex rates for TRY and UAH conversions
        let usdToTry = 43.50; // Fallback (updated realistic rate)
        let usdToUah = 41.00; // Fallback

        try {
            const forexResponse = await axios.get('https://api.frankfurter.app/latest?base=USD', { timeout: 3000 });
            const rates = forexResponse.data.rates;

            // Frankfurter doesn't have TRY/UAH, try alternative API
            if (!rates.TRY || !rates.UAH) { // Modified condition to check for both TRY and UAH
                const altResponse = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 3000 });
                const altRates = altResponse.data.rates;
                if (altRates.TRY) usdToTry = altRates.TRY;
                if (altRates.UAH) usdToUah = altRates.UAH;
                console.log(`Commodities using alt forex: USD/TRY=${usdToTry}, USD/UAH=${usdToUah}`);
            } else {
                if (rates.TRY) usdToTry = rates.TRY;
                if (rates.UAH) usdToUah = rates.UAH;
                console.log(`Commodities using Frankfurter: USD/TRY=${usdToTry}, USD/UAH=${usdToUah}`);
            }
        } catch (e) {
            console.log(`Using fallback forex rates for commodities: USD/TRY=${usdToTry}, USD/UAH=${usdToUah}`);
        }

        // Base prices with small random variation
        const commodities = {
            // Gold - Special Category (updated to current market price ~$5000/oz for 2026)
            'Gold': { basePrice: 5000, unit: 'oz', variation: 50, category: 'gold' },

            // Precious Metals (per ounce)
            'Silver': { basePrice: 29.5, unit: 'oz', variation: 1, category: 'metal' },
            'Platinum': { basePrice: 950, unit: 'oz', variation: 20, category: 'metal' },
            'Palladium': { basePrice: 1020, unit: 'oz', variation: 30, category: 'metal' },
            'Copper': { basePrice: 8500, unit: 'ton', variation: 150, category: 'metal' },

            // Energy
            'Crude Oil (WTI)': { basePrice: 78.50, unit: 'barrel', variation: 2, category: 'energy' },
            'Brent Oil': { basePrice: 83.20, unit: 'barrel', variation: 2, category: 'energy' },
            'Natural Gas': { basePrice: 2.85, unit: 'MMBtu', variation: 0.2, category: 'energy' },
            'Heating Oil': { basePrice: 2.65, unit: 'gallon', variation: 0.1, category: 'energy' },
            'Gasoline': { basePrice: 2.35, unit: 'gallon', variation: 0.1, category: 'energy' },

            // Agricultural
            'Wheat': { basePrice: 6.20, unit: 'bushel', variation: 0.3, category: 'agriculture' },
            'Corn': { basePrice: 4.75, unit: 'bushel', variation: 0.2, category: 'agriculture' },
            'Soybeans': { basePrice: 12.80, unit: 'bushel', variation: 0.5, category: 'agriculture' },
            'Coffee': { basePrice: 1.85, unit: 'lb', variation: 0.1, category: 'agriculture' },
            'Sugar': { basePrice: 0.22, unit: 'lb', variation: 0.02, category: 'agriculture' },
            'Cotton': { basePrice: 0.82, unit: 'lb', variation: 0.05, category: 'agriculture' },
            'Cocoa': { basePrice: 4250, unit: 'ton', variation: 150, category: 'agriculture' },
            'Rice': { basePrice: 17.50, unit: 'cwt', variation: 0.8, category: 'agriculture' },

            // Livestock
            'Live Cattle': { basePrice: 178.50, unit: 'lb', variation: 3, category: 'livestock' },
            'Lean Hogs': { basePrice: 82.30, unit: 'lb', variation: 2, category: 'livestock' }
        };

        const data = Object.entries(commodities).map(([name, info]) => {
            const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
            const price = info.basePrice * (1 + variation);
            const change = (Math.random() - 0.5) * 3; // ±1.5% daily change

            let result = {
                name: name,
                symbol: name.toUpperCase().replace(/[^A-Z]/g, ''),
                price: parseFloat(price.toFixed(2)),
                unit: info.unit,
                change: parseFloat(change.toFixed(2)),
                category: info.category
            };

            // Add per gram calculation and currency conversions for precious metals
            if ((info.category === 'metal' || info.category === 'gold') && info.unit === 'oz') {
                result.pricePerGram = parseFloat((price / GRAMS_PER_OUNCE).toFixed(2));

                // For Gold specifically, add TRY and UAH prices
                if (name === 'Gold') {
                    result.priceInTRY = parseFloat((price * usdToTry).toFixed(2));
                    result.priceInUAH = parseFloat((price * usdToUah).toFixed(2));
                    result.pricePerGramTRY = parseFloat((price * usdToTry / GRAMS_PER_OUNCE).toFixed(2));
                    result.pricePerGramUAH = parseFloat((price * usdToUah / GRAMS_PER_OUNCE).toFixed(2));
                }
            }

            return result;
        });

        cache.set(cacheKey, { data: data, timestamp: Date.now() });
        res.json(data);
    } catch (e) {
        console.error('Commodities error:', e.message);
        res.status(500).json({ error: 'Failed to fetch commodities data', details: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server active on port ${PORT}`));
