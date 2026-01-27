/**
 * CoinTelegraph Pro Market Dashboard v4.0
 * State-First Architecture for High Reliability
 */

// --- Configuration & Data Maps ---
const config = {
    crypto: ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'tron', 'chainlink', 'avalanche-2', 'shiba-inu', 'toncoin', 'stellar', 'sui'],
    stocks: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'INTC'],
    refreshInterval: 30000 // 30 seconds
};

// --- Application State ---
const State = {
    currentView: 'dashboard',
    language: 'en',
    data: {},
    isInitialized: false,
    storageAvailable: false
};

// --- Initialization ---
function bootstrap() {
    if (State.isInitialized) return;

    try {
        console.group('🚀 CoinTelegraph Initialization');

        // 1. Detect Environment
        State.storageAvailable = checkStorage();
        console.log('Environment:', { storage: State.storageAvailable, ua: navigator.userAgent });

        // 2. Load Persisted State
        const APP_VERSION = '4.0';
        if (State.storageAvailable) {
            if (localStorage.getItem('app_version') !== APP_VERSION) {
                console.log('New version detected - purging stale cache');
                const lang = localStorage.getItem('app_lang');
                localStorage.clear();
                localStorage.setItem('app_version', APP_VERSION);
                if (lang) localStorage.setItem('app_lang', lang);
            }
            State.language = localStorage.getItem('app_lang') || 'en';
            State.currentView = localStorage.getItem('app_view') || 'dashboard';
        }

        // 3. Setup UI Managers
        setupNavigation();
        setupClock();
        setupLanguage();
        setupSearch();
        setupRescuer();

        // 4. Start Data Engine
        fetchMarketData();
        setInterval(fetchMarketData, config.refreshInterval);

        State.isInitialized = true;
        console.log('Boot sequence complete.');
        console.groupEnd();
    } catch (e) {
        console.error('CRITICAL BOOT FAILURE:', e);
        showRescueUI();
    }
}

// --- Internal Managers ---

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            navigateTo(view);
        });
    });

    // Handle initial navigation state
    navigateTo(State.currentView, true);
}

function navigateTo(viewId, isInitial = false) {
    console.log(`Navigating to: ${viewId}`);

    // Update State
    State.currentView = viewId;
    if (State.storageAvailable) localStorage.setItem('app_view', viewId);

    // Update UI
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === viewId);
    });

    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.toggle('hidden', el.id !== `view-${viewId}`);
        el.classList.toggle('active', el.id === `view-${viewId}`);
    });

    // Update Title & Refresh Data
    if (typeof updateUILanguage === 'function') updateUILanguage();
    if (!isInitial) fetchMarketData();
}

async function fetchMarketData() {
    const view = State.currentView;
    const grid = document.getElementById(`${view}-grid`) || document.getElementById('crypto-grid');

    try {
        let endpoint = '';
        switch (view) {
            case 'dashboard': endpoint = `/api/crypto/markets?ids=${config.crypto.join(',')}`; break;
            case 'stocks': endpoint = `/api/stocks?symbols=${config.stocks.join(',')}`; break;
            case 'forex': endpoint = `/api/forex`; break;
            case 'commodities': endpoint = `/api/commodities`; break;
            case 'news': fetchNews(); return;
            default: return;
        }

        const res = await fetch(endpoint);
        const data = await res.json();

        if (data && Array.isArray(data)) {
            State.data[view] = data;
            renderView(view, data);
        }
    } catch (e) {
        console.warn(`Fetch error for ${view}:`, e);
        loadCachedData(view);
    }
}

function renderView(view, data) {
    const grid = document.getElementById(view === 'dashboard' ? 'crypto-grid' : `${view}-grid`);
    if (!grid) return;

    grid.innerHTML = '';

    if (view === 'commodities') {
        renderCommodities(grid, data);
        return;
    }

    data.forEach(item => {
        const card = createAssetCard(view, item);
        grid.appendChild(card);
    });
}

function createAssetCard(view, item) {
    const card = document.createElement('div');
    card.className = 'asset-card card';

    let name = '', symbol = '', price = '', change = 0, icon = '';

    if (view === 'dashboard') {
        name = item.name;
        symbol = item.symbol.toUpperCase();
        price = `$${item.current_price?.toLocaleString()}`;
        change = item.price_change_percentage_24h || 0;
        icon = getCryptoIcon(item.symbol, item.image);
    } else if (view === 'stocks') {
        name = getStockName(item.symbol);
        symbol = item.symbol;
        price = `$${item.price?.toFixed(2)}`;
        change = item.change || 0;
        icon = getStockIcon(item.symbol);
    } else if (view === 'forex') {
        name = item.symbol;
        symbol = '';
        price = item.price?.toFixed(4);
        change = item.change || 0;
        icon = getPairFlags(item.symbol);
    }

    const isUp = change >= 0;

    card.innerHTML = `
        <header>
            <div class="asset-name">${icon} ${name}</div>
            <span class="badge ${isUp ? 'bg-up' : 'bg-down'}">${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</span>
        </header>
        <div class="price-box">
            <div class="current-price">${price}</div>
            <div class="asset-symbol">${symbol}</div>
        </div>
    `;

    card.onclick = () => openAssetModal(view, item);
    return card;
}

function renderCommodities(grid, data) {
    const categories = {
        'gold': 'Gold',
        'metals': 'Precious Metals',
        'energy': 'Energy',
        'agri': 'Agriculture',
        'livestock': 'Livestock'
    };

    Object.entries(categories).forEach(([key, title]) => {
        const items = data.filter(d => d.category === key);
        if (items.length === 0) return;

        const header = document.createElement('div');
        header.className = 'category-header';
        header.style.gridColumn = '1 / -1';
        header.innerHTML = `<h3>${t(key === 'gold' ? 'gold_title' : key)}</h3>`;
        grid.appendChild(header);

        items.forEach(item => {
            if (key === 'gold') {
                // Render Gold variations (USD, TRY, UAH)
                renderGoldCards(grid, item);
            } else {
                const card = createCommodityCard(item);
                grid.appendChild(card);
            }
        });
    });
}

function createCommodityCard(item) {
    const card = document.createElement('div');
    const isUp = item.change >= 0;
    card.className = 'asset-card card';
    const priceDisplay = item.pricePerGram ? `$${item.pricePerGram}/g` : `$${item.price}/${item.unit}`;

    card.innerHTML = `
        <header>
            <div class="asset-name">${getCommodityIcon(item.name)} ${item.name}</div>
            <span class="badge ${isUp ? 'bg-up' : 'bg-down'}">${isUp ? '▲' : '▼'} ${Math.abs(item.change).toFixed(2)}%</span>
        </header>
        <div class="price-box">
            <div class="current-price">${priceDisplay}</div>
            <div class="asset-symbol">${item.symbol}</div>
        </div>
    `;
    return card;
}

function renderGoldCards(grid, item) {
    // 1. Global Gold Card
    grid.appendChild(createCommodityCard(item));

    // 2. TRY Card
    const cardTRY = document.createElement('div');
    cardTRY.className = 'asset-card card';
    cardTRY.innerHTML = `
        <header>
            <div class="asset-name">${getCommodityIcon('Gold')} <img src="https://flagcdn.com/w40/tr.png" style="width:20px"> ALTIN/TRY</div>
        </header>
        <div class="price-box">
            <div class="current-price" style="color:var(--warning)">₺${item.pricePerGramTRY?.toLocaleString('tr-TR')}</div>
            <div class="asset-symbol">GRAM ALTIN (TRY)</div>
        </div>
    `;
    grid.appendChild(cardTRY);

    // 3. UAH Card
    const cardUAH = document.createElement('div');
    cardUAH.className = 'asset-card card';
    cardUAH.innerHTML = `
        <header>
            <div class="asset-name">${getCommodityIcon('Gold')} <img src="https://flagcdn.com/w40/ua.png" style="width:20px"> GOLD/UAH</div>
        </header>
        <div class="price-box">
            <div class="current-price" style="color:var(--accent)">₴${item.pricePerGramUAH?.toLocaleString('uk-UA')}</div>
            <div class="asset-symbol">GRAM GOLD (UAH)</div>
        </div>
    `;
    grid.appendChild(cardUAH);
}

// --- Modals & UI Helpers ---

function openAssetModal(type, item) {
    const modal = document.getElementById('asset-modal');
    if (!modal) return;

    document.getElementById('modal-name').innerText = item.name || item.symbol;
    document.getElementById('modal-price').innerText = createAssetCard(type, item).querySelector('.current-price').innerText;

    const change = (type === 'dashboard') ? item.price_change_percentage_24h : item.change;
    const badge = document.getElementById('modal-change');
    const isUp = change >= 0;
    badge.className = `badge ${isUp ? 'bg-up' : 'bg-down'}`;
    badge.innerText = `${isUp ? '▲' : '▼'} ${Math.abs(change || 0).toFixed(2)}%`;

    modal.classList.remove('hidden');
    drawChart(isUp);
}

function drawChart(isUp) {
    const el = document.getElementById('detail-chart');
    el.innerHTML = '';

    const options = {
        series: [{ data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 60) }],
        chart: { type: 'area', height: 200, sparkline: { enabled: true }, animations: { enabled: false } },
        stroke: { curve: 'smooth', width: 3 },
        colors: [isUp ? '#00c853' : '#ff3d00'],
        fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } }
    };

    if (window.ApexCharts) {
        new ApexCharts(el, options).render();
    }
}

function setupClock() {
    const el = document.getElementById('date-display');
    const tick = () => {
        el.innerText = new Date().toLocaleTimeString('tr-TR');
    };
    tick();
    setInterval(tick, 1000);
}

function checkStorage() {
    try {
        localStorage.setItem('_test', '1');
        localStorage.removeItem('_test');
        return true;
    } catch (e) { return false; }
}

function setupRescuer() {
    document.getElementById('btn-rescue')?.addEventListener('click', () => {
        localStorage.clear();
        location.reload(true);
    });
}

// Global Error Handler
window.onerror = (msg, src, line) => {
    console.error(`Script Error: ${msg} at ${src}:${line}`);
    showToast(`System Notice: Active updates in progress...`);
};

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast card';
    toast.style.padding = '10px 20px';
    toast.style.marginTop = '10px';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Utility mapper for Stock names (frontend fallback)
function getStockName(symbol) {
    const names = { 'AAPL': 'Apple', 'TSLA': 'Tesla', 'NVDA': 'Nvidia', 'MSFT': 'Microsoft', 'AMZN': 'Amazon', 'GOOGL': 'Google', 'META': 'Meta', 'NFLX': 'Netflix', 'AMD': 'AMD', 'INTC': 'Intel' };
    return names[symbol] || symbol;
}

// --- Boot Trigger ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

// Close Modal logic
document.getElementById('close-modal')?.onclick = () => document.getElementById('asset-modal').classList.add('hidden');
window.onclick = (e) => { if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden'); };
