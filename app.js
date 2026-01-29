/**
 * CoinTelegraph Pro Market Dashboard v5.0
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
        'PYPL', 'SHOP', 'UBER', 'ABNB', 'COIN', 'MSTR', 'QCOM', 'TXN'
    ],
    refreshInterval: 10000,
    viewOrder: ['dashboard', 'stocks', 'commodities', 'forex', 'news', 'settings'],
    currencies: [
        'USD', 'EUR', 'GBP', 'TRY', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'UAH',
        'MXN', 'ZAR', 'HKD', 'SGD', 'SEK', 'NOK', 'NZD', 'INR', 'BRL'
    ]
};

// --- Application State ---
const State = {
    currentView: 'dashboard',
    language: 'en',
    data: {},
    isInitialized: false,
    storageAvailable: false,
    refreshTimer: 0,
    isFirstLoad: true
};

// --- Initialization ---
function bootstrap() {
    if (State.isInitialized) return;

    try {

        // 1. Detect Environment
        State.storageAvailable = checkStorage();
        console.log('Environment:', { storage: State.storageAvailable, ua: navigator.userAgent });

        // 2. Load Persisted State
        const APP_VERSION = '5.0';
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
        setupRefreshLogic();

        State.isInitialized = true;
        console.log('Boot sequence complete.');
    } catch (e) {
        console.error('CRITICAL BOOT FAILURE:', e);
        showRescueUI();
    }
}

function setupRefreshLogic() {
    const timerEl = document.getElementById('refresh-timer');
    const progressEl = document.getElementById('refresh-progress');
    const refreshBtn = document.getElementById('manual-refresh');

    let countdown = config.refreshInterval / 1000;
    State.refreshTimer = countdown;

    const updateUI = () => {
        if (timerEl) timerEl.innerText = `${t('next_update')}: ${State.refreshTimer}s`;
        if (progressEl) {
            const percent = ((config.refreshInterval / 1000 - State.refreshTimer) / (config.refreshInterval / 1000)) * 100;
            progressEl.style.width = `${percent}%`;
        }
    };

    setInterval(() => {
        State.refreshTimer--;
        if (State.refreshTimer <= 0) {
            State.refreshTimer = config.refreshInterval / 1000;
            fetchMarketData(true);
        }
        updateUI();
    }, 1000);

    refreshBtn?.addEventListener('click', () => {
        if (refreshBtn.classList.contains('spinning')) return;
        refreshBtn.classList.add('spinning');
        State.refreshTimer = config.refreshInterval / 1000;
        fetchMarketData(true).finally(() => {
            setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
        });
    });

    updateUI();
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

        // 1. Search Cryptos (Config + Data)
        config.crypto.forEach(symbol => {
            const coinData = State.data['dashboard']?.find(c => c.id === symbol || c.symbol === symbol);
            const name = coinData ? coinData.name : symbol.charAt(0).toUpperCase() + symbol.slice(1);
            if (name.toLowerCase().includes(query) || symbol.toLowerCase().includes(query)) {
                results.push({
                    type: 'dashboard',
                    data: coinData || { id: symbol, symbol: symbol },
                    name: name,
                    symbol: symbol,
                    icon: getCryptoIcon(symbol, coinData?.image)
                });
            }
        });

        // 2. Search Stocks (Config + Data)
        config.stocks.forEach(symbol => {
            const stockData = State.data['stocks']?.find(s => s.symbol === symbol);
            const name = getStockName(symbol);
            if (name.toLowerCase().includes(query) || symbol.toLowerCase().includes(query)) {
                results.push({
                    type: 'stocks',
                    data: stockData || { symbol: symbol },
                    name: name,
                    symbol: symbol,
                    icon: getStockIcon(symbol)
                });
            }
        });

        // 3. Search Commodities (Data only as they are dynamic)
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

    // Setup Swipe Listeners
    setupSwipeNavigation();
}

function setupSwipeNavigation() {
    const container = document.getElementById('view-container');
    const slider = document.getElementById('views-slider');
    if (!container || !slider) return;

    let isDragging = false;
    let currentTranslate = 0;
    const initialIndex = config.viewOrder.indexOf(State.currentView);
    const initialOffset = -(initialIndex * (slider.offsetWidth / config.viewOrder.length));
    let prevTranslate = initialOffset; // Correct alignment
    let animationID = 0;
    // Sync displacement for manual navigation
    window.syncSwipeTranslate = (viewId) => {
        const idx = config.viewOrder.indexOf(viewId);
        prevTranslate = -(idx * (slider.offsetWidth / config.viewOrder.length));
        currentTranslate = prevTranslate;
    };

    let startPos = 0;
    let startY = 0;
    let isHorizontalSwipe = false;

    container.addEventListener('touchstart', touchStart, { passive: false });
    container.addEventListener('touchend', touchEnd, { passive: false });
    container.addEventListener('touchmove', touchMove, { passive: false });

    container.addEventListener('mousedown', touchStart);
    container.addEventListener('mouseup', touchEnd);
    container.addEventListener('mouseleave', touchEnd);
    container.addEventListener('mousemove', touchMove);

    function touchStart(event) {
        startPos = getPositionX(event);
        startY = getPositionY(event);
        isHorizontalSwipe = false;
        isDragging = false; // Don't start dragging until we know direction
        slider.style.transition = 'none';
        container.style.cursor = 'grabbing';
    }

    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);
        isHorizontalSwipe = false;
        container.style.cursor = 'default';

        const movedBy = currentTranslate - prevTranslate;
        const width = container.offsetWidth;
        const currentIndex = config.viewOrder.indexOf(State.currentView);

        let targetIndex = currentIndex;
        // Snap threshold: 20% of width or high velocity
        if (movedBy < -width * 0.15 && currentIndex < config.viewOrder.length - 1) {
            targetIndex = currentIndex + 1;
        } else if (movedBy > width * 0.15 && currentIndex > 0) {
            targetIndex = currentIndex - 1;
        }

        slider.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        navigateTo(config.viewOrder[targetIndex]);

        // Update prevTranslate for next session
        prevTranslate = -(targetIndex * (100 / config.viewOrder.length)) * (slider.offsetWidth / 100);
    }

    function touchMove(event) {
        const currentX = getPositionX(event);
        const currentY = getPositionY(event);
        const deltaX = Math.abs(currentX - startPos);
        const deltaY = Math.abs(currentY - startY);

        // Determine swipe direction on first significant movement
        if (!isDragging && !isHorizontalSwipe && (deltaX > 10 || deltaY > 10)) {
            isHorizontalSwipe = deltaX > deltaY;
            if (isHorizontalSwipe) {
                isDragging = true;
                animationID = requestAnimationFrame(animation);
            }
        }

        // Only handle horizontal swipes
        if (isDragging && isHorizontalSwipe) {
            if (event.cancelable) event.preventDefault();
            const currentPosition = getPositionX(event);
            const currentIndex = config.viewOrder.indexOf(State.currentView);
            const baseTranslate = -(currentIndex * container.offsetWidth);
            currentTranslate = baseTranslate + (currentPosition - startPos);

            // Real-time tab feedback: Update active state if we pass 50%
            const movedBy = currentTranslate - baseTranslate;
            const threshold = container.offsetWidth * 0.5;
            let feedbackIndex = currentIndex;
            if (movedBy < -threshold && currentIndex < config.viewOrder.length - 1) feedbackIndex++;
            if (movedBy > threshold && currentIndex > 0) feedbackIndex--;

            const feedbackView = config.viewOrder[feedbackIndex];
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.toggle('active', el.dataset.view === feedbackView);
            });
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function getPositionY(event) {
        return event.type.includes('mouse') ? event.pageY : event.touches[0].clientY;
    }

    function animation() {
        if (isDragging) {
            const index = config.viewOrder.indexOf(State.currentView);
            // We use percentage-based translate for the slider as it's defined in 600% width
            const offsetPx = currentTranslate;
            const fullWidth = slider.offsetWidth;
            const percentage = (offsetPx / fullWidth) * 100;
            slider.style.transform = `translateX(${percentage}%)`;
            requestAnimationFrame(animation);
        }
    }
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

    const slider = document.getElementById('views-slider');
    const currentIndex = config.viewOrder.indexOf(viewId);
    if (slider) {
        slider.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        slider.style.transform = `translateX(-${(currentIndex * 100) / config.viewOrder.length}%)`;

        // Update swipe tracker to prevent jumps
        if (typeof window.syncSwipeTranslate === 'function') {
            window.syncSwipeTranslate(viewId);
        }

    }

    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.toggle('active', el.id === `view-${viewId}`);
    });

    // Update Title & Refresh Data
    if (typeof updateUILanguage === 'function') updateUILanguage();

    // Smooth scroll to top when changing views
    document.querySelector('.view-container')?.scrollTo(0, 0);

    if (!isInitial) fetchMarketData();
}

async function fetchMarketData(isRefresh = false) {
    const view = State.currentView;
    const grid = document.getElementById(`${view}-grid`) || document.getElementById('crypto-grid');

    if (isRefresh) {
        grid.querySelectorAll('.asset-card').forEach(card => card.classList.add('updated-flash'));
    }

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

            // Update "Last Updated" text
            const lastUpdateEl = document.getElementById('label-last-updated');
            if (lastUpdateEl) {
                const now = new Date().toLocaleTimeString();
                lastUpdateEl.innerText = `${t('last_updated')}: ${now}`;
            }
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

    if (view === 'commodities') {
        renderCommodities(grid, data);
        renderSparklines(view, data);
        return;
    }

    if (view === 'forex' && typeof updateConverter === 'function') {
        updateConverter(data);
        // Fall through to render cards below the converter
    }

    // Optimization: Use DocumentFragment if the grid is mostly empty (first load)
    const isFirstLoad = grid.children.length <= 1; // 1 for skeleton
    const fragment = isFirstLoad ? document.createDocumentFragment() : null;

    data.forEach(item => {
        const cardId = `card-${view}-${(item.id || item.symbol || item.name).replace(/[^a-z0-9]/gi, '-')}`;
        let card = document.getElementById(cardId);

        if (card) {
            updateAssetCard(card, view, item);
        } else {
            card = createAssetCard(view, item);
            card.id = cardId;
            if (fragment) fragment.appendChild(card);
            else grid.appendChild(card);
        }
    });

    if (fragment) {
        grid.innerHTML = '';
        grid.appendChild(fragment);
    }

    // STABILITY FIX: Do NOT remove cards that are missing from this specific snapshot.
    // Finnhub/API might return partial data or fail temporarily.
    // We only want to ADD or UPDATE cards, never delete them during a live session to prevent "flickering".

    // Legacy removal code commented out for stability:
    /*
    const activeIds = data.map(item => `card-${view}-${(item.id || item.symbol || item.name).replace(/[^a-z0-9]/gi, '-')}`);
    grid.querySelectorAll('.asset-card').forEach(el => {
        if (!activeIds.includes(el.id)) el.remove();
    });
    */

    renderSparklines(view, data);
}

function updateAssetCard(card, view, item) {
    let price = '', change = 0;

    if (view === 'dashboard') {
        price = `$${item.current_price?.toLocaleString()}`;
        change = item.price_change_percentage_24h || 0;
    } else if (view === 'stocks') {
        price = `$${item.price?.toFixed(2)}`;
        change = item.change || 0;
    } else if (view === 'forex') {
        price = item.price?.toFixed(4);
        change = item.change || 0;
    } else if (view === 'commodities') {
        price = `$${item.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        change = item.price_change_percentage_24h || 0;
    }

    const isUp = change >= 0;

    // Update background classes
    card.classList.toggle('bullish', isUp);
    card.classList.toggle('bearish', !isUp);

    // Update Price
    const priceEl = card.querySelector('.current-price');
    if (priceEl && priceEl.innerText !== price) {
        priceEl.innerText = price;
    }

    // Update Badge
    const badgeEl = card.querySelector('.badge');
    if (badgeEl) {
        badgeEl.className = `badge ${isUp ? 'bg-up' : 'bg-down'}`;
        badgeEl.innerHTML = `${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%`;
    }
}

// Store chart instances to avoid re-rendering
const chartStore = new Map();

function renderSparklines(view, data) {
    if (!window.ApexCharts) return;

    const delay = window.innerWidth < 768 ? 250 : 100; // More delay on mobile to keep scrolling smooth
    setTimeout(() => {
        data.forEach(item => {
            const id = `spark-${view}-${(item.id || item.symbol || item.name).replace(/[^a-z0-9]/gi, '-')}`;
            const el = document.getElementById(id);
            if (!el) return;

            const isUp = (view === 'dashboard' ? (item.price_change_percentage_24h >= 0) : (item.change >= 0));
            const color = isUp ? '#00c853' : '#ff3d00';

            if (chartStore.has(id)) {
                const chart = chartStore.get(id);
                // Only update color if it changed
                if (chart.opts && chart.opts.colors && chart.opts.colors[0] !== color) {
                    chart.updateOptions({ colors: [color] });
                }
                // We keep the old data or generate new subtle movement
                chart.updateSeries([{ data: Array.from({ length: 8 }, () => Math.floor(Math.random() * 40) + 60) }]);
            } else {
                const options = {
                    series: [{ data: Array.from({ length: 8 }, () => Math.floor(Math.random() * 40) + 60) }],
                    chart: { type: 'area', height: 40, sparkline: { enabled: true }, animations: { enabled: true } },
                    stroke: { curve: 'smooth', width: 2 },
                    colors: [color],
                    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0 } },
                    tooltip: { enabled: false }
                };
                const chart = new ApexCharts(el, options);
                chart.render();
                chartStore.set(id, chart);
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

    card.classList.add(isUp ? 'bullish' : 'bearish');

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
        'metals': t('metals'),
        'energy': t('energy'),
        'agri': t('agri'),
        'livestock': t('livestock')
    };

    Object.entries(categories).forEach(([key, title]) => {
        const items = data.filter(d => d.category === key);
        if (items.length === 0) return;

        let groupWrapper = document.getElementById(`group-${key}`);
        if (!groupWrapper) {
            groupWrapper = document.createElement('div');
            groupWrapper.id = `group-${key}`;
            groupWrapper.className = 'commodity-group-box';
            groupWrapper.innerHTML = `
                <div class="category-header"><h3>${title}</h3></div>
                <div class="grid-layout inner-grid" id="grid-${key}"></div>
            `;
            grid.appendChild(groupWrapper);
        }

        const innerGrid = groupWrapper.querySelector('.inner-grid');
        items.forEach(item => {
            // SPECIAL HANDLING FOR GOLD (Investing.com Layout)
            if (item.name === 'Gold') {
                const cardId = 'card-commodities-gold'; // Known ID
                let card = document.getElementById(cardId);
                if (card) {
                    updateAssetCard(card, 'commodities', item);
                    updateGoldCards(item);
                } else {
                    renderGoldCards(innerGrid, item);
                }
                return; // Stop processing Gold
            }

            // GENERIC HANDLING
            const cardId = `card-commodities-${(item.id || item.symbol || item.name).replace(/[^a-z0-9]/gi, '-')}`;
            let card = document.getElementById(cardId);

            if (card) {
                updateAssetCard(card, 'commodities', item);
            } else {
                card = createCommodityCard(item);
                card.id = cardId;
                innerGrid.appendChild(card);
            }
        });
    });
}

function createCommodityCard(item) {
    const card = document.createElement('div');
    const isUp = item.change >= 0;
    card.className = `asset-card card ${isUp ? 'bullish' : 'bearish'}`;
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

function updateGoldCards(item) {
    const cardTRY = document.getElementById('card-commodities-gold-try');
    const cardUAH = document.getElementById('card-commodities-gold-uah');
    if (cardTRY) {
        const priceEl = cardTRY.querySelector('.current-price');
        if (priceEl) priceEl.innerText = `₺${item.pricePerGramTRY ? item.pricePerGramTRY.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '...'}`;
    }
    if (cardUAH) {
        const priceEl = cardUAH.querySelector('.current-price');
        if (priceEl) priceEl.innerText = `₴${item.pricePerGramUAH ? item.pricePerGramUAH.toLocaleString('uk-UA', { maximumFractionDigits: 0 }) : '...'}`;
    }
}

function renderGoldCards(grid, item) {
    // 1. Gold USD Card (Spot oz)
    const goldCard = createCommodityCard(item);
    goldCard.id = `card-commodities-gold`;
    const goldHeader = goldCard.querySelector('.asset-name');
    if (goldHeader) goldHeader.innerHTML = `${getCommodityIcon('Gold')} Gold USD`;
    grid.appendChild(goldCard);

    // 2. Gold TRY Card
    const cardTRY = document.createElement('div');
    const isUp = item.change >= 0;
    cardTRY.id = 'card-commodities-gold-try';
    cardTRY.className = `asset-card card ${isUp ? 'bullish' : 'bearish'}`;
    cardTRY.innerHTML = `
        <header>
            <div class="asset-name">${getCommodityIcon('Gold')} Gold TRY</div>
            <span class="badge ${isUp ? 'bg-up' : 'bg-down'}">${isUp ? '▲' : '▼'} ${Math.abs(item.change).toFixed(2)}%</span>
        </header>
        <div class="price-box">
            <div class="current-price" style="color:var(--warning)">₺${item.pricePerGramTRY ? item.pricePerGramTRY.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '...'}</div>
            <div class="asset-symbol">GRAM</div>
        </div>
        <div id="spark-commodities-gold-try" class="mini-chart"></div>`;
    cardTRY.onclick = () => openAssetModal('commodities', item);
    grid.appendChild(cardTRY);

    // 3. Gold UAH Card
    const cardUAH = document.createElement('div');
    cardUAH.id = 'card-commodities-gold-uah';
    cardUAH.className = `asset-card card ${isUp ? 'bullish' : 'bearish'}`;
    cardUAH.innerHTML = `
        <header>
            <div class="asset-name">${getCommodityIcon('Gold')} Gold UAH</div>
            <span class="badge ${isUp ? 'bg-up' : 'bg-down'}">${isUp ? '▲' : '▼'} ${Math.abs(item.change).toFixed(2)}%</span>
        </header>
        <div class="price-box">
            <div class="current-price" style="color:var(--accent)">₴${item.pricePerGramUAH ? item.pricePerGramUAH.toLocaleString('uk-UA', { maximumFractionDigits: 0 }) : '...'}</div>
            <div class="asset-symbol">GRAM</div>
        </div>
        <div id="spark-commodities-gold-uah" class="mini-chart"></div>`;
    cardUAH.onclick = () => openAssetModal('commodities', item);
    grid.appendChild(cardUAH);

    // Render Sparklines for the two gram cards (Spot is handled by renderView)
    renderSparklines('commodities', [
        { name: 'gold-try', change: item.change },
        { name: 'gold-uah', change: item.change }
    ]);
}

// --- Converter Logic ---
function updateConverter(data) {
    const from = document.getElementById('conv-from');
    const to = document.getElementById('conv-to');
    if (!from || !to) return;

    // 1. Build a Map of "Value in USD" for every currency
    // Base is USD = 1.0
    const valuesInUSD = { 'USD': 1.0 };

    // Add all currencies found in data pairs
    const currencies = new Set(['USD']);

    data.forEach(p => {
        const [base, quote] = p.symbol.split('/');
        currencies.add(base);
        currencies.add(quote);

        // Normalize to USD value
        // Case 1: EUR/USD = 1.08 -> 1 EUR is 1.08 USD
        if (quote === 'USD') {
            valuesInUSD[base] = p.price;
        }
        // Case 2: USD/TRY = 34.0 -> 1 TRY is (1/34) USD
        else if (base === 'USD') {
            valuesInUSD[quote] = 1 / p.price;
        }
    });

    // Populate Select Options (only if empty)
    if (from.options.length === 0) {
        Array.from(currencies).sort().forEach(c => {
            from.add(new Option(c, c));
            to.add(new Option(c, c));
        });
        from.value = 'USD';
        to.value = 'TRY';
    }

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

        // Universal Cross-Rate Calculation
        // Rate (From -> To) = Value(From in USD) / Value(To in USD)
        const valFrom = valuesInUSD[f];
        const valTo = valuesInUSD[t];

        if (valFrom && valTo) {
            const rate = valFrom / valTo;
            const result = amount * rate;
            resEl.innerText = result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (infoEl) infoEl.innerText = `1 ${f} = ${rate.toFixed(4)} ${t}`;
        } else {
            resEl.innerText = "---";
            if (infoEl) infoEl.innerText = "Oran bulunamadı";
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
    calc(); // Initial calc
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

function drawChart(isUp, priceData = null) {
    const el = document.getElementById('detail-chart');
    if (!el) return;
    el.innerHTML = '';

    // Generate more realistic data points
    const basePrices = priceData || Array.from({ length: 24 }, (_, i) => {
        const trend = isUp ? 1 : -1;
        return 100 + (trend * i * 0.5) + (Math.random() * 5);
    });

    const options = {
        series: [{
            name: 'Price',
            data: basePrices.map(p => parseFloat(p.toFixed(2)))
        }],
        chart: {
            type: 'area',
            height: 250,
            sparkline: { enabled: false },
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        stroke: { curve: 'smooth', width: 3 },
        colors: [isUp ? '#00c853' : '#ff3d00'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100]
            }
        },
        xaxis: {
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            show: true,
            labels: {
                style: { colors: 'var(--text-dim)', fontSize: '10px' },
                formatter: (val) => `$${val.toLocaleString()}`
            }
        },
        grid: {
            show: true,
            borderColor: 'rgba(255,255,255,0.05)',
            strokeDashArray: 4
        },
        tooltip: {
            theme: 'dark',
            x: { show: false },
            y: {
                title: { formatter: () => '' },
                formatter: (val) => `<span style="font-weight:700; color:#fff">$${val.toLocaleString()}</span>`
            },
            marker: { show: false }
        }
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

