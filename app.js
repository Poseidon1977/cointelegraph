const config = {
    // apiKey removed for security, now handled by backend
    symbols: [
        { id: 'BINANCE:BTCUSDT', name: 'Bitcoin', display: 'BTC', cg_id: 'bitcoin' },
        { id: 'BINANCE:ETHUSDT', name: 'Ethereum', display: 'ETH', cg_id: 'ethereum' },
        { id: 'BINANCE:BNBUSDT', name: 'Binance Coin', display: 'BNB', cg_id: 'binancecoin' },
        { id: 'BINANCE:SOLUSDT', name: 'Solana', display: 'SOL', cg_id: 'solana' },
        { id: 'BINANCE:XRPUSDT', name: 'XRP', display: 'XRP', cg_id: 'ripple' },
        { id: 'BINANCE:ADAUSDT', name: 'Cardano', display: 'ADA', cg_id: 'cardano' },
        { id: 'BINANCE:DOGEUSDT', name: 'Dogecoin', display: 'DOGE', cg_id: 'dogecoin' },
        { id: 'BINANCE:AVAXUSDT', name: 'Avalanche', display: 'AVAX', cg_id: 'avalanche-2' },
        { id: 'BINANCE:TRXUSDT', name: 'Tron', display: 'TRX', cg_id: 'tron' },
        { id: 'BINANCE:DOTUSDT', name: 'Polkadot', display: 'DOT', cg_id: 'polkadot' },
        { id: 'BINANCE:LINKUSDT', name: 'Chainlink', display: 'LINK', cg_id: 'chainlink' },
        { id: 'BINANCE:PEPEUSDT', name: 'Pepe', display: 'PEPE', cg_id: 'pepe' },
        { id: 'BINANCE:BONKUSDT', name: 'Bonk', display: 'BONK', cg_id: 'bonk' },
        { id: 'BINANCE:SHIBUSDT', name: 'Shiba Inu', display: 'SHIB', cg_id: 'shiba-inu' },
        { id: 'BINANCE:LTCUSDT', name: 'Litecoin', display: 'LTC', cg_id: 'litecoin' },
        { id: 'BINANCE:NEARUSDT', name: 'NEAR Protocol', display: 'NEAR', cg_id: 'near' },
        { id: 'BINANCE:SUIUSDT', name: 'Sui', display: 'SUI', cg_id: 'sui' },
        { id: 'BINANCE:APTUSDT', name: 'Aptos', display: 'APT', cg_id: 'aptos' },
        { id: 'BINANCE:FETUSDT', name: 'Fetch.ai', display: 'FET', cg_id: 'fetch-ai' },
        { id: 'BINANCE:RENDERUSDT', name: 'Render', display: 'RENDER', cg_id: 'render-token' }
    ],
    stockSymbols: [
        { id: 'AAPL', name: 'Apple Inc.', display: 'AAPL' },
        { id: 'MSFT', name: 'Microsoft', display: 'MSFT' },
        { id: 'NVDA', name: 'Nvidia', display: 'NVDA' },
        { id: 'GOOGL', name: 'Alphabet', display: 'GOOGL' },
        { id: 'AMZN', name: 'Amazon', display: 'AMZN' },
        { id: 'TSLA', name: 'Tesla', display: 'TSLA' },
        { id: 'META', name: 'Meta Platforms', display: 'META' },
        { id: 'NFLX', name: 'Netflix', display: 'NFLX' },
        { id: 'AMD', name: 'AMD', display: 'AMD' },
        { id: 'ORCL', name: 'Oracle', display: 'ORCL' }
    ],
    commoditySymbols: [
        { id: 'GLD', name: 'Gold Index', display: 'XAU' },
        { id: 'SLV', name: 'Silver Index', display: 'XAG' },
        { id: 'TR_GOLD_24K', name: '24 Ayar Gram Altın', display: 'Gram (TR)', virtual: true, flag: 'TR' },
        { id: 'TR_GOLD_22K', name: '22 Ayar Gram Altın', display: 'Gram (TR)', virtual: true, flag: 'TR' },
        { id: 'TR_GOLD_14K', name: '14 Ayar Gram Altın', display: 'Gram (TR)', virtual: true, flag: 'TR' },
        { id: 'UA_GOLD_24K', name: '24K Gram Gold (UA)', display: 'Gram (UA)', virtual: true, flag: 'UA' },
        { id: 'UA_GOLD_18K', name: '18K Gram Gold (UA)', display: 'Gram (UA)', virtual: true, flag: 'UA' },
        { id: 'TR_SILVER', name: 'Has Gümüş (TR)', display: 'Gümüş', virtual: true, flag: 'TR' },
        { id: 'UA_SILVER', name: 'Pure Silver (UA)', display: 'Silver', virtual: true, flag: 'UA' }
    ],
    forexSymbols: [
        { id: 'OANDA:USD_TRY', name: 'USD/TRY', display: 'USD/TRY', flag: 'TR' },
        { id: 'OANDA:EUR_TRY', name: 'EUR/TRY', display: 'EUR/TRY', flag: 'TR' },
        { id: 'OANDA:GBP_TRY', name: 'GBP/TRY', display: 'GBP/TRY', flag: 'TR' },
        { id: 'OANDA:EUR_USD', name: 'EUR/USD', display: 'EUR/USD', flag: 'US' },
        { id: 'OANDA:GBP_USD', name: 'GBP/USD', display: 'GBP/USD', flag: 'US' },
        { id: 'OANDA:USD_JPY', name: 'USD/JPY', display: 'USD/JPY', flag: 'JP' },
        { id: 'OANDA:AUD_USD', name: 'AUD/USD', display: 'AUD/USD', flag: 'US' },
        { id: 'OANDA:USD_CAD', name: 'USD/CAD', display: 'USD/CAD', flag: 'CA' },
        { id: 'OANDA:USD_CHF', name: 'USD/CHF', display: 'USD/CHF', flag: 'CH' },
        { id: 'OANDA:NZD_USD', name: 'NZD/USD', display: 'NZD/USD', flag: 'US' },
        { id: 'OANDA:USD_ZAR', name: 'USD/ZAR', display: 'USD/ZAR', flag: 'ZA' },
        { id: 'OANDA:USD_SGD', name: 'USD/SGD', display: 'USD/SGD', flag: 'SG' },
        { id: 'OANDA:USD_MXN', name: 'USD/MXN', display: 'USD/MXN', flag: 'MX' },
        { id: 'OANDA:USD_CNH', name: 'USD/CNY', display: 'USD/CNY', flag: 'CN' },
        { id: 'OANDA:USD_INR', name: 'USD/INR', display: 'USD/INR', flag: 'IN' },
        { id: 'OANDA:USD_SAR', name: 'USD/SAR', display: 'USD/SAR', flag: 'SA' }
    ]
};

const state = {
    coins: {},
    stocks: {},
    commodities: {},
    forex: {},
    currentView: 'dashboard',
    chartInstance: null,
    socket: null,
    activeSymbol: null,
    chartData: [],
    generalNewsCache: [],
    alertHistory: new Set(),
    exchangeRates: null // New storage for converter
};

// DOM Elements
const cryptoGrid = document.getElementById('crypto-grid');
const stocksGrid = document.getElementById('stocks-grid');
const commoditiesGrid = document.getElementById('commodities-grid');
const forexGrid = document.getElementById('forex-grid');
const globalNewsFeed = document.getElementById('global-news-feed');
const detailsModal = document.getElementById('details-modal');
const modalTitle = document.getElementById('modal-title');
const liveIndicator = document.getElementById('live-indicator');
const assetNewsList = document.getElementById('asset-news-list');
const recChart = document.getElementById('rec-chart');
const recText = document.getElementById('rec-text');
const priceChartDiv = document.getElementById('price-chart');
const exchangesList = document.getElementById('exchanges-list');
const marketStatsDiv = document.getElementById('market-stats');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const toastContainer = document.getElementById('toast-container');

// Converter Elements
const convAmount = document.getElementById('conv-amount');
const convFrom = document.getElementById('conv-from');
const convTo = document.getElementById('conv-to');
const convResult = document.getElementById('conv-result');
const convRateInfo = document.getElementById('conv-rate-info');
const convSwapBtn = document.getElementById('conv-swap');

function init() {
    setupNavigation();
    setupSearch();
    setupConverter();
    updateDateTime();
    initWebSocket();
    fetchGlobalNews(); // Render initial news
    fetchPrices();
    fetchStocks();
    fetchCommodities();
    fetchForex();
    fetchExchangeRates(); // New for converter

    setInterval(fetchPrices, 20000);
    setInterval(fetchStocks, 60000);
    setInterval(fetchCommodities, 60000);
    setInterval(fetchForex, 60000);
    setInterval(fetchExchangeRates, 3600000); // 1 hour for converter rates
    setInterval(updateDateTime, 1000);
    setInterval(() => { fetchGlobalNews(state.currentView !== 'news'); }, 900000);

    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('SW Registered', reg))
                .catch(err => console.log('SW Registration failed', err));
        });

        // Auto-reload when new Service Worker takes over
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    }
}

// --- CONVERTER LOGIC ---
async function fetchExchangeRates() {
    try {
        const res = await fetch('/api/forex/latest');
        const data = await res.json();
        if (data.rates) {
            state.exchangeRates = data.rates;
            populateCurrencyDropdowns();
            calculateConversion();
            updateConverterChart();
        }
    } catch (e) { console.error('Exchange Rate API failed'); }
}

async function updateConverterChart() {
    const from = convFrom.value;
    const to = convTo.value;
    const container = document.getElementById('converter-mini-chart');
    if (!container) return;

    try {
        container.innerHTML = '<div style="color:#666; font-size:0.7rem; text-align:center; padding-top:20px">Loading Trend...</div>';

        let symbol = `OANDA:${from}_${to}`;
        const toVal = Math.floor(Date.now() / 1000);
        const fromVal = toVal - (7 * 24 * 3600); // 7 days back

        const fetchCandles = async (s) => {
            const r = await fetch(`/api/candles?symbol=${s}&resolution=60&from=${fromVal}&to=${toVal}&type=forex`);
            return await r.json();
        };

        let data = await fetchCandles(symbol);

        if (data.s === 'ok') {
            renderSparkline('converter-mini-chart', data.c.slice(-24), '#00e5ff');
        } else {
            // Try reverse
            symbol = `OANDA:${to}_${from}`;
            data = await fetchCandles(symbol);
            if (data.s === 'ok') {
                const inverted = data.c.slice(-24).map(v => 1 / v);
                renderSparkline('converter-mini-chart', inverted, '#00e5ff');
            } else {
                container.innerHTML = '<div style="color:#444; font-size:0.8rem; text-align:center; padding-top:20px">Trend chart unavailable for this pair</div>';
            }
        }
    } catch (e) {
        container.innerHTML = '';
    }
}

function populateCurrencyDropdowns() {
    if (!state.exchangeRates || !convFrom || !convTo) return;

    const currencies = Object.keys(state.exchangeRates).sort();
    const fromVal = convFrom.value || 'USD';
    const toVal = convTo.value || 'TRY';

    convFrom.innerHTML = '';
    convTo.innerHTML = '';

    currencies.forEach(curr => {
        const opt1 = document.createElement('option');
        opt1.value = curr; opt1.textContent = curr;
        if (curr === fromVal) opt1.selected = true;
        convFrom.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = curr; opt2.textContent = curr;
        if (curr === toVal) opt2.selected = true;
        convTo.appendChild(opt2);
    });
}

function setupConverter() {
    if (!convAmount) return;
    const calc = () => {
        calculateConversion();
        updateConverterChart();
    };
    convAmount.addEventListener('input', calculateConversion); // Just recalc amount on typing
    convFrom.addEventListener('change', calc);
    convTo.addEventListener('change', calc);

    if (convSwapBtn) {
        convSwapBtn.onclick = () => {
            const temp = convFrom.value;
            convFrom.value = convTo.value;
            convTo.value = temp;
            calc();
        };
    }
}

function calculateConversion() {
    if (!state.exchangeRates || !convAmount || !convResult) return;

    const amount = parseFloat(convAmount.value) || 0;
    const from = convFrom.value;
    const to = convTo.value;

    const fromRate = state.exchangeRates[from];
    const toRate = state.exchangeRates[to];

    if (fromRate && toRate) {
        const result = (amount * toRate) / fromRate;
        convResult.textContent = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const singleRate = (1 * toRate) / fromRate;
        convRateInfo.textContent = `1 ${from} = ${singleRate.toFixed(4)} ${to}`;
    }
}

// --- CORE SYSTEM ---
function initWebSocket() {
    // Note: Live WebSocket usually requires a client-side key. 
    // If config.apiKey is removed, we gracefully disable live updates for now.
    console.log('WebSocket: Live updates disabled in backend-mode (requires secure proxying)');
}

function handleTrade(trades) {
    if (!state.activeSymbol) return;
    const relevantTrades = trades.filter(t => t.s === state.activeSymbol);
    if (relevantTrades.length === 0) return;
    const lastTrade = relevantTrades[relevantTrades.length - 1];
    const price = lastTrade.p;

    const activeItem = state.coins[state.activeSymbol] || state.stocks[state.activeSymbol] || state.commodities[state.activeSymbol] || state.forex[state.activeSymbol] || { name: state.activeSymbol, price: 0 };
    modalTitle.innerHTML = `<div style="display:flex; align-items:center; gap:10px">
        <span style="font-size:1.5rem">${activeItem.name}</span>
        <span style="font-weight:400; font-size:1.2rem; color:${getPriceColor(price, activeItem.price)}">$${price}</span>
     </div>`;
    activeItem.price = price;
    updateChartLive(price, lastTrade.t);
}

function getPriceColor(newPrice, oldPrice) {
    if (!oldPrice) return '#fff';
    return newPrice >= oldPrice ? '#00c853' : '#ff3d00';
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
            item.classList.add('active');
            const target = item.dataset.target;
            state.currentView = target;
            const view = document.getElementById(`view-${target}`);
            if (view) {
                view.classList.remove('hidden');
                view.classList.add('active');
                if (target === 'news') fetchGlobalNews();
            }
            document.getElementById('page-title').textContent = item.textContent.trim();
        });
    });
    document.getElementById('close-modal').onclick = closeModal;
}

function setupSearch() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
}

async function handleSearch() {
    const query = searchInput.value.toUpperCase().trim();
    if (!query) return;
    searchBtn.innerHTML = '⏳';
    const cryptoSymbol = `BINANCE:${query}USDT`;
    try {
        const res = await fetch(`/api/quote?symbol=${cryptoSymbol}`);
        const data = await res.json();
        if (data.c > 0) {
            openDetails({ id: cryptoSymbol, name: query, display: query, price: data.c, change: data.d, percentChange: data.dp, cg_id: null }, 'crypto');
            searchInput.value = ''; searchBtn.innerHTML = '🔍'; return;
        }
    } catch (e) { }
    try {
        const res = await fetch(`/api/quote?symbol=${query}`);
        const data = await res.json();
        if (data.c > 0) {
            openDetails({ id: query, name: query, display: query, price: data.c, change: data.d, percentChange: data.dp }, 'stock');
            searchInput.value = ''; searchBtn.innerHTML = '🔍'; return;
        }
    } catch (e) { }
    alert(`Asset '${query}' not found.`);
    searchBtn.innerHTML = '🔍';
}

function closeModal() {
    detailsModal.classList.add('hidden');
    if (state.chartInstance) { state.chartInstance.destroy(); state.chartInstance = null; }
    if (state.activeSymbol && state.socket.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': state.activeSymbol }));
    }
    state.activeSymbol = null;
    liveIndicator.style.display = 'none';
}

function updateDateTime() {
    const d = new Date();
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const display = document.getElementById('date-display');
    if (display) display.innerHTML = `<div class="date-text">${dateStr}</div><div class="clock-digits">${timeStr}</div>`;
}

// --- FETCHERS ---
async function fetchPrices() {
    try {
        // Fetch from Backend (CoinGecko Proxy)
        const ids = config.symbols.map(s => s.cg_id).join(',');
        const res = await fetch(`/api/crypto/markets?ids=${ids}`);
        const data = await res.json();

        data.forEach(coin => {
            const sym = config.symbols.find(s => s.cg_id === coin.id);
            if (sym) {
                state.coins[sym.id] = {
                    ...sym,
                    price: coin.current_price,
                    change: coin.price_change_24h,
                    percentChange: coin.price_change_percentage_24h_in_currency,
                    sparkline: coin.sparkline_in_7d.price.slice(-24) // Last 24 points
                };
                checkAlerts(state.coins[sym.id]);
            }
        });
        renderGrid(state.coins, cryptoGrid, true);
    } catch (e) {
        // Fallback to legacy (Requires proxy support)
        const queue = [...config.symbols];
        await Promise.all(queue.map(async (coin) => {
            try {
                const res = await fetch(`/api/quote?symbol=${coin.id}`);
                const data = await res.json();
                state.coins[coin.id] = { ...coin, price: data.c, change: data.d, percentChange: data.dp };
            } catch (e) { }
        }));
        renderGrid(state.coins, cryptoGrid, true);
    }
}

async function fetchStocks() {
    const queue = [...config.stockSymbols];
    await Promise.all(queue.map(async (stock) => {
        try {
            const res = await fetch(`/api/quote?symbol=${stock.id}`);
            const data = await res.json();

            // Fetch candles for sparkline (wider range for weekends)
            const to = Math.floor(Date.now() / 1000);
            const from = to - (7 * 24 * 3600); // 7 days back
            const candleRes = await fetch(`/api/candles?symbol=${stock.id}&resolution=60&from=${from}&to=${to}&type=stock`);
            const candleData = await candleRes.json();

            state.stocks[stock.id] = {
                ...stock,
                price: data.c,
                change: data.d,
                percentChange: data.dp,
                sparkline: (candleData.s === 'ok') ? candleData.c.slice(-24) : []
            };
        } catch (e) { }
    }));
    renderGrid(state.stocks, stocksGrid, false);
}

async function fetchCommodities() {
    const queue = config.commoditySymbols.filter(c => !c.virtual);
    const virtuals = config.commoditySymbols.filter(c => c.virtual);

    await Promise.all(queue.map(async (com) => {
        try {
            const res = await fetch(`/api/quote?symbol=${com.id}`);
            const data = await res.json();

            const to = Math.floor(Date.now() / 1000);
            const from = to - (7 * 24 * 3600);
            const candleRes = await fetch(`/api/candles?symbol=${com.id}&resolution=60&from=${from}&to=${to}&type=stock`);
            const candleData = await candleRes.json();

            state.commodities[com.id] = {
                ...com,
                price: data.c,
                change: data.d,
                percentChange: data.dp,
                sparkline: (candleData.s === 'ok') ? candleData.c.slice(-24) : []
            };
        } catch (e) { }
    }));

    // Calculate Virtual Localized Prices
    const spotGold = state.commodities['GLD']?.price || 0;
    const spotSilver = state.commodities['SLV']?.price || 0;
    const goldSpark = state.commodities['GLD']?.sparkline || [];
    const silverSpark = state.commodities['SLV']?.sparkline || [];
    const tryRate = state.exchangeRates?.TRY || 0;
    const uahRate = state.exchangeRates?.UAH || 0;

    if (spotGold && tryRate && goldSpark.length > 0) {
        const gramGoldUSD = spotGold / 31.1035;
        const prices = { '24K': 1, '22K': 0.916, '18K': 0.750, '14K': 0.585 };
        const scaleFactor = tryRate / 31.1035;

        state.commodities['TR_GOLD_24K'] = {
            ...virtuals.find(v => v.id === 'TR_GOLD_24K'),
            price: gramGoldUSD * tryRate * prices['24K'],
            currency: '₺',
            sparkline: goldSpark.map(v => v * scaleFactor * prices['24K']),
            change: state.commodities['GLD'].change * scaleFactor * prices['24K'],
            percentChange: state.commodities['GLD'].percentChange
        };
        state.commodities['TR_GOLD_22K'] = {
            ...virtuals.find(v => v.id === 'TR_GOLD_22K'),
            price: gramGoldUSD * tryRate * prices['22K'],
            currency: '₺',
            sparkline: goldSpark.map(v => v * scaleFactor * prices['22K']),
            change: state.commodities['GLD'].change * scaleFactor * prices['22K'],
            percentChange: state.commodities['GLD'].percentChange
        };
        state.commodities['TR_GOLD_14K'] = {
            ...virtuals.find(v => v.id === 'TR_GOLD_14K'),
            price: gramGoldUSD * tryRate * prices['14K'],
            currency: '₺',
            sparkline: goldSpark.map(v => v * scaleFactor * prices['14K']),
            change: state.commodities['GLD'].change * scaleFactor * prices['14K'],
            percentChange: state.commodities['GLD'].percentChange
        };

        if (uahRate) {
            const uahScale = uahRate / 31.1035;
            state.commodities['UA_GOLD_24K'] = {
                ...virtuals.find(v => v.id === 'UA_GOLD_24K'),
                price: gramGoldUSD * uahRate * prices['24K'],
                currency: '₴',
                sparkline: goldSpark.map(v => v * uahScale * prices['24K']),
                change: state.commodities['GLD'].change * uahScale * prices['24K'],
                percentChange: state.commodities['GLD'].percentChange
            };
            state.commodities['UA_GOLD_18K'] = {
                ...virtuals.find(v => v.id === 'UA_GOLD_18K'),
                price: gramGoldUSD * uahRate * prices['18K'],
                currency: '₴',
                sparkline: goldSpark.map(v => v * uahScale * prices['18K']),
                change: state.commodities['GLD'].change * uahScale * prices['18K'],
                percentChange: state.commodities['GLD'].percentChange
            };
        }
    }

    if (spotSilver && tryRate && silverSpark.length > 0) {
        const silverScale = tryRate / 31.1035;
        state.commodities['TR_SILVER'] = {
            ...virtuals.find(v => v.id === 'TR_SILVER'),
            price: (spotSilver / 31.1035) * tryRate,
            currency: '₺',
            sparkline: silverSpark.map(v => v * silverScale),
            change: state.commodities['SLV'].change * silverScale,
            percentChange: state.commodities['SLV'].percentChange
        };
        if (uahRate) {
            const uaSilverScale = uahRate / 31.1035;
            state.commodities['UA_SILVER'] = {
                ...virtuals.find(v => v.id === 'UA_SILVER'),
                price: (spotSilver / 31.1035) * uahRate,
                currency: '₴',
                sparkline: silverSpark.map(v => v * uaSilverScale),
                change: state.commodities['SLV'].change * uaSilverScale,
                percentChange: state.commodities['SLV'].percentChange
            };
        }
    }

    renderGrid(state.commodities, commoditiesGrid, false);
}

async function fetchForex() {
    const queue = [...config.forexSymbols];
    await Promise.all(queue.map(async (fx) => {
        try {
            const res = await fetch(`/api/quote?symbol=${fx.id}`);
            const data = await res.json();

            // resolution '60' means hourly candles, wider range for weekends
            const to = Math.floor(Date.now() / 1000);
            const from = to - (7 * 24 * 3600); // 7 days back
            const candleRes = await fetch(`/api/candles?symbol=${fx.id}&resolution=60&from=${from}&to=${to}&type=forex`);
            const candleData = await candleRes.json();

            state.forex[fx.id] = {
                ...fx,
                price: data.c,
                change: data.d,
                percentChange: data.dp,
                sparkline: (candleData.s === 'ok') ? candleData.c.slice(-24) : []
            };
        } catch (e) { }
    }));
    renderGrid(state.forex, forexGrid, false);
}

function renderGrid(collection, container, isCrypto) {
    if (Object.keys(collection).length > 0 && container.querySelector('.loading')) container.innerHTML = '';
    Object.values(collection).forEach(item => renderCard(item, container, isCrypto));
}

function renderCard(item, container, isCrypto) {
    let card = document.getElementById(`card-${item.id}`);
    if (!card) {
        card = document.createElement('div');
        card.id = `card-${item.id}`;
        card.className = `crypto-card ${item.change >= 0 ? 'up' : 'down'}`;
        card.onclick = () => openDetails(item, isCrypto ? 'crypto' : 'stock');
        container.appendChild(card);
    }
    const isUp = (item.change >= 0);
    let iconSrc;
    if (isCrypto) iconSrc = `https://assets.coincap.io/assets/icons/${item.display.toLowerCase()}@2x.png`;
    else {
        if (item.display === 'XAU') iconSrc = 'https://via.placeholder.com/32/FFD700/000000?text=Au';
        else if (item.display === 'XAG') iconSrc = 'https://via.placeholder.com/32/C0C0C0/000000?text=Ag';
        else if (item.display === 'WTI') iconSrc = 'https://via.placeholder.com/32/000000/FFFFFF?text=Oil';
        else if (item.flag) iconSrc = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${item.flag}.svg`;
        else iconSrc = `https://logo.clearbit.com/${item.name.split(' ')[0].toLowerCase()}.com`;
    }
    const containerId = `spark-${item.id.replace(/[:_]/g, '-')}`;
    card.innerHTML = `
        <div class="card-header">
            <div style="display:flex; align-items:center; gap:8px">
                <img src="${iconSrc}" onerror="this.src='https://via.placeholder.com/32/333/fff?text=${item.display[0]}'" class="coin-logo ${item.flag ? 'flag-icon' : ''}" alt="${item.display}">
                <div>
                    <span style="font-weight:600; font-size:0.9rem; display:block; line-height:1.1">${item.name}</span>
                    <span style="color:#666; font-size:0.7rem">${item.display}</span>
                </div>
            </div>
            <div class="change-badge ${(isUp || !item.change) ? 'change-up' : 'change-down'}">
                ${(isUp || !item.change) ? '+' : ''}${item.percentChange ? item.percentChange.toFixed(1) : '0'}%
            </div>
        </div>
        <div class="coin-price">${item.currency || '$'}${item.price ? item.price.toFixed(item.price < 1 ? 4 : 2) : '--'}</div>
        <div class="sparkline-container" id="${containerId}"></div>
    `;
    card.className = `crypto-card ${isUp ? 'up' : 'down'}`;

    if (item.sparkline && item.sparkline.length > 0) {
        renderSparkline(containerId, item.sparkline, isUp ? '#00c853' : '#ff3d00');
    }
}

function renderSparkline(containerId, data, color) {
    const options = {
        series: [{ data: data }],
        chart: {
            type: 'line',
            height: 40,
            sparkline: { enabled: true },
            animations: { enabled: false }
        },
        stroke: { curve: 'smooth', width: 2 },
        colors: [color],
        tooltip: { enabled: false }
    };
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    const chart = new ApexCharts(el, options);
    chart.render();
}

async function fetchGlobalNews(cacheOnly = false) {
    if (!cacheOnly) globalNewsFeed.innerHTML = '<div class="loading">Fetching news...</div>';
    try {
        const [cryptoRes, generalRes] = await Promise.all([
            fetch(`/api/news?category=crypto`),
            fetch(`/api/news?category=general`)
        ]);
        const crypto = await cryptoRes.json();
        const general = await generalRes.json();
        const merged = [...crypto, ...general].sort((a, b) => b.datetime - a.datetime);
        state.generalNewsCache = merged;
        if (!cacheOnly) renderNewsList(merged);
    } catch (e) { }
}

function renderNewsList(articles) {
    globalNewsFeed.innerHTML = '';
    articles.slice(0, 20).forEach(news => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <img src="${news.image || 'https://via.placeholder.com/200x150?text=News'}" class="news-image" onerror="this.src='https://via.placeholder.com/200x150?text=News'">
            <div class="news-content">
                <div><a href="${news.url}" target="_blank" class="news-title">${news.headline}</a>
                <p style="color:#aaa; font-size:0.9rem; margin-top:5px">${news.summary.substring(0, 120)}...</p></div>
                <div class="news-source">${news.source} • ${new Date(news.datetime * 1000).toLocaleTimeString()}</div>
            </div>`;
        globalNewsFeed.appendChild(card);
    });
}

function checkAlerts(item) {
    if (!item.percentChange) return;
    const pct = parseFloat(item.percentChange);
    if (Math.abs(pct) >= 5) {
        const alertId = `${item.id}_${pct > 0 ? 'UP' : 'DOWN'}`;
        if (!state.alertHistory.has(alertId)) {
            showToast(`${item.display} Moving!`, `${item.name} is ${pct > 0 ? 'up' : 'down'} ${Math.abs(pct).toFixed(2)}%`, pct > 0 ? 'up' : 'down');
            state.alertHistory.add(alertId);
        }
    }
}

function showToast(title, body, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div class="toast-header">${title}</div><div class="toast-body">${body}</div>`;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 5000);
}

// --- MODAL & CHARTS ---
async function openDetails(item, type) {
    state.activeSymbol = item.id;
    const isVirtual = item.virtual;
    const baseId = item.id.startsWith('TR_GOLD') || item.id.startsWith('UA_GOLD') ? 'GLD' :
        (item.id.startsWith('TR_SILVER') || item.id.startsWith('UA_SILVER') ? 'SLV' : item.id);

    modalTitle.innerHTML = `<div style="display:flex; align-items:center; gap:10px">
        <span style="font-size:1.5rem">${item.name}</span>
        <span style="font-weight:400; font-size:1.2rem; color:${getPriceColor(item.price, 0)}">${item.currency || '$'}${item.price.toLocaleString()}</span>
    </div>`;
    detailsModal.classList.remove('hidden');

    // 1. Fetch & Render 30-day Chart
    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 3600);
    const apiType = (type === 'crypto' || type === 'forex') ? type : 'stock';

    try {
        const res = await fetch(`/api/candles?symbol=${baseId}&resolution=D&from=${from}&to=${to}&type=${apiType}`);
        const data = await res.json();
        if (data.s === 'ok') {
            let prices = data.c;
            if (isVirtual) {
                const rate = item.id.includes('TR') ? (state.exchangeRates?.TRY || 1) : (state.exchangeRates?.UAH || 1);
                const purity = item.id.includes('24K') ? 1 : (item.id.includes('22K') ? 0.916 : (item.id.includes('18K') ? 0.75 : (item.id.includes('14K') ? 0.585 : 1)));
                const scale = rate / 31.1035;
                prices = prices.map(p => p * scale * purity);
            }
            renderChart(prices, data.t.map(t => new Date(t * 1000).toLocaleDateString()));
        }
    } catch (e) { console.error('Modal Chart failed', e); }

    // 2. Fetch & Render News
    try {
        const newsRes = await fetch(`/api/news?category=${type === 'crypto' ? 'crypto' : 'general'}`);
        const news = await newsRes.json();
        assetNewsList.innerHTML = '';
        news.slice(0, 5).forEach(n => {
            const li = document.createElement('li');
            li.style.marginBottom = '15px';
            li.innerHTML = `<a href="${n.url}" target="_blank" style="color:#00e5ff; text-decoration:none; font-weight:600">${n.headline}</a>
                            <p style="font-size:0.8rem; color:#888; margin-top:3px">${n.source} • ${new Date(n.datetime * 1000).toLocaleDateString()}</p>`;
            assetNewsList.appendChild(li);
        });
    } catch (e) { }
}

function renderChart(data, labels) {
    const options = {
        series: [{ name: 'Price', data: data }],
        chart: { type: 'area', height: 350, toolbar: { show: false }, background: 'transparent' },
        colors: ['#2962ff'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0 } },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: labels, labels: { style: { colors: '#666' } } },
        yaxis: { labels: { style: { colors: '#666' }, formatter: (v) => v.toFixed(2) } },
        grid: { borderColor: '#222' },
        theme: { mode: 'dark' },
        tooltip: { theme: 'dark' }
    };
    if (state.chartInstance) state.chartInstance.destroy();
    state.chartInstance = new ApexCharts(document.getElementById('price-chart'), options);
    state.chartInstance.render();
}

init();
