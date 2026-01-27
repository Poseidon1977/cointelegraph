/**
 * CoinTelegraph Pro Market Dashboard v4.0
 * State-First Architecture for High Reliability
 */

// --- Configuration & Data Maps ---
const config = {
    crypto: [
        'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'tron', 'chainlink',
        'avalanche-2', 'shiba-inu', 'toncoin', 'stellar', 'sui', 'litecoin', 'bitcoin-cash', 'near', 'aptos', 'cosmos',
        'fantom', 'optimism', 'arbitrum', 'render-token', 'okb', 'monero', 'kaspa', 'bittensor', 'staked-ether',
        'internet-computer', 'uniswap', 'ethereum-classic', 'mantle', 'thorchain', 'jupiter-exchange-solana', 'pyth-network',
        'bonk', 'pepe', 'dogwifhat', 'floki', 'sei-network', 'celestia', 'arbitrum', 'optimism', 'blast', 'zksync'
    ],
    stocks: [
        'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'INTC',
        'KO', 'MCD', 'DIS', 'V', 'JPM', 'WMT', 'PG', 'NKE', 'ORCL', 'CRM', 'ADBE',
        'PYPL', 'SHOP', 'UBER', 'ABNB', 'COIN', 'MSTR', 'AMD', 'QCOM', 'TXN'
    ],
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

function setupLanguage() {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    langSelect.value = State.language;
    langSelect.addEventListener('change', (e) => {
        State.language = e.target.value;
        if (State.storageAvailable) localStorage.setItem('app_lang', State.language);
        updateUILanguage();
    });
}

function setupSearch() {
    const searchInput = document.getElementById('global-search');
    const dropdown = document.getElementById('search-dropdown');
    if (!searchInput || !dropdown) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            dropdown.classList.add('hidden');
            return;
        }

        // Aggregate all searchable assets
        const results = [];

        // 1. Search Cryptos
        if (State.data['dashboard']) {
            State.data['dashboard'].forEach(coin => {
                if (coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)) {
                    results.push({ type: 'dashboard', data: coin, name: coin.name, symbol: coin.symbol, icon: getCryptoIcon(coin.symbol, coin.image) });
                }
            });
        }

        // 2. Search Stocks
        if (State.data['stocks']) {
            State.data['stocks'].forEach(stock => {
                const stockName = getStockName(stock.symbol);
                if (stockName.toLowerCase().includes(query) || stock.symbol.toLowerCase().includes(query)) {
                    results.push({ type: 'stocks', data: stock, name: stockName, symbol: stock.symbol, icon: getStockIcon(stock.symbol) });
                }
            });
        }

        // 3. Search Commodities
        if (State.data['commodities']) {
            State.data['commodities'].forEach(item => {
                const translatedName = t(item.name);
                if (item.name.toLowerCase().includes(query) ||
                    translatedName.toLowerCase().includes(query) ||
                    (item.symbol && item.symbol.toLowerCase().includes(query))) {
                    results.push({
                        type: 'commodities',
                        data: item,
                        name: translatedName,
                        symbol: item.symbol || '',
                        icon: getCommodityIcon(item.name)
                    });
                }
            });
        }

        const filtered = results.slice(0, 10);

        if (filtered.length > 0) {
            dropdown.innerHTML = filtered.map(res => `
                <div class="search-item" onclick="State.currentView='${res.type}';navigateTo('${res.type}');openAssetModal('${res.type}', ${JSON.stringify(res.data).replace(/"/g, '&quot;')})">
                    <span class="search-icon">${res.icon}</span>
                    <div class="search-meta">
                        <span class="search-name">${res.name}</span>
                        <span class="search-tag">${res.symbol.toUpperCase()} • ${t('search_' + res.type.replace('dashboard', 'crypto'))}</span>
                    </div>
                </div>
            `).join('');
            dropdown.classList.remove('hidden');
        } else {
            dropdown.innerHTML = `<div class="search-info">${t('search_no_results')}</div>`;
            dropdown.classList.remove('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) dropdown.classList.add('hidden');
    });
}

async function fetchNews() {
    const feed = document.getElementById('news-feed');
    if (!feed) return;

    try {
        const res = await fetch('/api/news');
        const data = await res.json();

        feed.innerHTML = data.slice(0, 10).map(item => `
            <div class="news-card card">
                ${item.image ? `<img src="${item.image}" class="news-image">` : ''}
                <div class="news-meta">
                    <span class="source">${item.source}</span>
                    <span class="date">${new Date(item.datetime * 1000).toLocaleTimeString()}</span>
                </div>
                <h3><a href="${item.url}" target="_blank">${item.headline}</a></h3>
                <p>${item.summary?.substring(0, 120)}...</p>
            </div>
        `).join('');
    } catch (e) {
        feed.innerHTML = `<div class="error">${t('news_error')}</div>`;
    }
}

function loadCachedData(view) {
    if (!State.storageAvailable) return;
    const cached = localStorage.getItem(`cache_${view}`);
    if (cached) {
        try {
            const data = JSON.parse(cached);
            renderView(view, data);
            console.log(`Loaded fallback cache for ${view}`);
        } catch (e) { }
    }
}

function showRescueUI() {
    document.getElementById('rescue-layer')?.classList.remove('hidden');
}

// Global UI Language Update Trigger (for translations.js)
window.setupLanguage = setupLanguage;

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

    const viewEl = document.getElementById(`view-${viewId}`);
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.toggle('hidden', el.id !== `view-${viewId}`);
        el.classList.toggle('active', el.id === `view-${viewId}`);
    });

    // Update Title & Refresh Data
    if (typeof updateUILanguage === 'function') updateUILanguage();

    // Smooth scroll to top when changing views
    document.querySelector('.view-container')?.scrollTo(0, 0);

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
            // Persist for offline
            if (State.storageAvailable) localStorage.setItem(`cache_${view}`, JSON.stringify(data));
            renderView(view, data);
        }
    } catch (e) {
        console.warn(`Fetch error for ${view}:`, e);
        loadCachedData(view);
    }
}

function renderView(view, data) {
    const gridId = view === 'dashboard' ? 'crypto-grid' : `${view}-grid`;
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    if (view === 'commodities') {
        renderCommodities(grid, data);
        renderSparklines(view, data);
        return;
    }

    if (view === 'forex' && typeof updateConverter === 'function') {
        updateConverter(data);
    }

    data.forEach(item => {
        const card = createAssetCard(view, item);
        grid.appendChild(card);
    });

    renderSparklines(view, data);
}

function renderSparklines(view, data) {
    if (!window.ApexCharts) return;

    const items = view === 'commodities' ? data : data; // For commodities we might need to be specific but general work for now

    setTimeout(() => { // Small delay to ensure DOM is ready
        data.forEach(item => {
            const id = `spark-${view}-${(item.id || item.symbol || item.name).replace(/[^a-z0-9]/gi, '-')}`;
            const el = document.getElementById(id);
            if (!el) return;

            const isUp = (view === 'dashboard' ? (item.price_change_percentage_24h >= 0) : (item.change >= 0));

            const options = {
                series: [{ data: Array.from({ length: 8 }, () => Math.floor(Math.random() * 40) + 60) }],
                chart: { type: 'area', height: 40, sparkline: { enabled: true }, animations: { enabled: true } },
                stroke: { curve: 'smooth', width: 2 },
                colors: [isUp ? '#00c853' : '#ff3d00'],
                fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0 } },
                tooltip: { enabled: false }
            };

            new ApexCharts(el, options).render();

            // Extra logic for specialized gold cards
            if (view === 'commodities' && item.category === 'gold') {
                ['try', 'uah'].forEach(suffix => {
                    const extraId = `spark-commodities-gold-${suffix}`;
                    const extraEl = document.getElementById(extraId);
                    if (extraEl) {
                        new ApexCharts(extraEl, options).render();
                    }
                });
            }
        });
    }, 100);
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
    const sparkId = `spark-${view}-${(item.id || item.symbol || item.name).replace(/[^a-z0-9]/gi, '-')}`;

    card.innerHTML = `
        <header>
            <div class="asset-name">${icon} ${name}</div>
            <span class="badge ${isUp ? 'bg-up' : 'bg-down'}">${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</span>
        </header>
        <div class="price-box">
            <div class="current-price">${price}</div>
            <div class="asset-symbol">${symbol}</div>
        </div>
        <div id="${sparkId}" class="mini-chart"></div>
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

    grid.innerHTML = '';

    Object.entries(categories).forEach(([key, title]) => {
        const items = data.filter(d => d.category === key);
        if (items.length === 0) return;

        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'commodity-group-box';

        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `<h3>${t(key === 'gold' ? 'gold_title' : key)}</h3>`;
        groupWrapper.appendChild(header);

        const innerGrid = document.createElement('div');
        innerGrid.className = 'grid-layout';
        groupWrapper.appendChild(innerGrid);

        items.forEach(item => {
            if (key === 'gold') {
                renderGoldCards(innerGrid, item);
            } else {
                const card = createCommodityCard(item);
                innerGrid.appendChild(card);
            }
        });

        grid.appendChild(groupWrapper);
    });
}

function createCommodityCard(item) {
    const card = document.createElement('div');
    const isUp = item.change >= 0;
    card.className = 'asset-card card';
    const priceDisplay = item.pricePerGram
        ? `$${item.pricePerGram}/${t('unit_g')}`
        : `$${item.price}/${t(item.unit)}`;
    const sparkId = `spark-commodities-${(item.id || item.symbol || item.name).replace(/[^a-z0-9]/gi, '-')}`;

    card.innerHTML = `
        <header>
            <div class="asset-name">${getCommodityIcon(item.name)} ${t(item.name)}</div>
            <span class="badge ${isUp ? 'bg-up' : 'bg-down'}">${isUp ? '▲' : '▼'} ${Math.abs(item.change).toFixed(2)}%</span>
        </header>
        <div class="price-box">
            <div class="current-price">${priceDisplay}</div>
            <div class="asset-symbol">${item.symbol}</div>
        </div>
        <div id="${sparkId}" class="mini-chart"></div>
    `;
    card.onclick = () => openAssetModal('commodities', item);
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
            <div class="asset-name">${getCommodityIcon('Gold')} <img src="https://flagcdn.com/w40/tr.png" style="width:20px"> ${t('altin_try')}</div>
        </header>
        <div class="price-box">
            <div class="current-price" style="color:var(--warning)">₺${item.priceInTRY ? (item.priceInTRY / 31.1035).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '...'}</div>
            <div class="asset-symbol">${t('gram_altin_try')}</div>
        </div>
        <div id="spark-commodities-gold-try" class="mini-chart"></div>
    `;
    cardTRY.onclick = () => openAssetModal('commodities', item);
    grid.appendChild(cardTRY);

    // 3. UAH Card
    const cardUAH = document.createElement('div');
    cardUAH.className = 'asset-card card';
    cardUAH.innerHTML = `
        <header>
            <div class="asset-name">${getCommodityIcon('Gold')} <img src="https://flagcdn.com/w40/ua.png" style="width:20px"> ${t('altin_uah')}</div>
        </header>
        <div class="price-box">
            <div class="current-price" style="color:var(--accent)">₴${item.priceInUAH ? (item.priceInUAH / 31.1035).toLocaleString('uk-UA', { maximumFractionDigits: 0 }) : '...'}</div>
            <div class="asset-symbol">${t('gram_altin_uah')}</div>
        </div>
        <div id="spark-commodities-gold-uah" class="mini-chart"></div>
    `;
    cardUAH.onclick = () => openAssetModal('commodities', item);
    grid.appendChild(cardUAH);
}

// --- Converter Logic ---
function updateConverter(data) {
    const from = document.getElementById('conv-from');
    const to = document.getElementById('conv-to');
    if (!from || !to || from.options.length > 0) return;

    // Get unique currencies
    const currencies = new Set();
    data.forEach(p => {
        const parts = p.symbol.split('/');
        parts.forEach(c => currencies.add(c));
    });

    Array.from(currencies).sort().forEach(c => {
        from.add(new Option(c, c));
        to.add(new Option(c, c));
    });

    from.value = 'USD';
    to.value = 'TRY';

    const calc = () => {
        const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
        const f = from.value;
        const t = to.value;
        const resEl = document.getElementById('conv-res-val');
        const infoEl = document.getElementById('conv-info');

        if (f === t) {
            resEl.innerText = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (infoEl) infoEl.innerText = `1 ${f} = 1.00 ${t}`;
            return;
        }

        // Simple cross-rate logic
        const pair = data.find(p => p.symbol === `${f}/${t}`);
        const rev = data.find(p => p.symbol === `${t}/${f}`);

        let rate = 0;
        if (pair) {
            rate = pair.price;
        } else if (rev) {
            rate = 1 / rev.price;
        }

        if (rate) {
            const result = amount * rate;
            resEl.innerText = result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (infoEl) infoEl.innerText = `1 ${f} = ${rate.toFixed(4)} ${t}`;
        } else {
            resEl.innerText = "---";
            if (infoEl) infoEl.innerText = "";
        }
    };

    document.getElementById('conv-amount').oninput = calc;
    from.onchange = calc;
    to.onchange = calc;
    document.getElementById('conv-swap').onclick = () => {
        const tmp = from.value;
        from.value = to.value;
        to.value = tmp;
        calc();
    };
    calc();
}

// --- Modals & UI Helpers ---

function openAssetModal(type, item) {
    const modal = document.getElementById('asset-modal');
    if (!modal) return;

    document.getElementById('modal-name').innerText = t(item.name || item.symbol);

    // Safety check for price
    let priceText = '...';
    try {
        if (type === 'commodities') {
            priceText = item.pricePerGram
                ? `$${item.pricePerGram}/${t('unit_g')}`
                : `$${item.price}/${t(item.unit)}`;
        } else {
            priceText = createAssetCard(type, item).querySelector('.current-price').innerText;
        }
    } catch (e) { }

    document.getElementById('modal-price').innerText = priceText;

    const change = (type === 'dashboard') ? (item.price_change_percentage_24h || 0) : (item.change || 0);
    const badge = document.getElementById('modal-change');
    const isUp = change >= 0;
    badge.className = `badge ${isUp ? 'bg-up' : 'bg-down'}`;
    badge.innerText = `${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%`;

    modal.classList.remove('hidden');
    drawChart(isUp);
}

function drawChart(isUp) {
    const el = document.getElementById('detail-chart');
    if (!el) return;
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
    if (!el) return;
    const tick = () => {
        const lang = localStorage.getItem('app_lang') || 'en';
        const locale = lang === 'ua' ? 'uk-UA' : (lang === 'tr' ? 'tr-TR' : (lang === 'de' ? 'de-DE' : 'en-US'));
        el.innerText = new Date().toLocaleTimeString(locale);
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
    showToast(`System Notice: Auto-repair triggered...`);
};

function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
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
    return t(symbol); // Now using the translation system for all stocks
}

// --- Boot Trigger ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

// Close Modal logic
document.getElementById('close-modal')?.addEventListener('click', () => document.getElementById('asset-modal').classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden'); });

