const config = {
    crypto: [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
        { id: 'solana', name: 'Solana', symbol: 'SOL' },
        { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
        { id: 'ripple', name: 'XRP', symbol: 'XRP' },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
        { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
        { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
        { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
        { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
        { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
        { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM' },
        { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
        { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH' },
        { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB' },
        { id: 'tron', name: 'Tron', symbol: 'TRX' },
        { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR' },
        { id: 'aptos', name: 'Aptos', symbol: 'APT' },
        { id: 'internet-computer', name: 'Internet Computer', symbol: 'ICP' },
        { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
        { id: 'monero', name: 'Monero', symbol: 'XMR' },
        { id: 'eos', name: 'EOS', symbol: 'EOS' },
        { id: 'vechain', name: 'VeChain', symbol: 'VET' },
        { id: 'algorand', name: 'Algorand', symbol: 'ALGO' },
        { id: 'tezos', name: 'Tezos', symbol: 'XTZ' },
        { id: 'theta-token', name: 'Theta', symbol: 'THETA' },
        { id: 'filecoin', name: 'Filecoin', symbol: 'FIL' },
        { id: 'hedera-hashgraph', name: 'Hedera', symbol: 'HBAR' },
        { id: 'elrond-erd-2', name: 'MultiversX', symbol: 'EGLD' },
        { id: 'fantom', name: 'Fantom', symbol: 'FTM' },
        { id: 'the-sandbox', name: 'Sandbox', symbol: 'SAND' },
        { id: 'decentraland', name: 'Decentraland', symbol: 'MANA' },
        { id: 'axie-infinity', name: 'Axie Infinity', symbol: 'AXS' },
        { id: 'enjincoin', name: 'Enjin', symbol: 'ENJ' },
        { id: 'chiliz', name: 'Chiliz', symbol: 'CHZ' },
        { id: 'flow', name: 'Flow', symbol: 'FLOW' },
        { id: 'aave', name: 'Aave', symbol: 'AAVE' },
        { id: 'maker', name: 'Maker', symbol: 'MKR' },
        { id: 'compound-governance-token', name: 'Compound', symbol: 'COMP' }
    ],
    stocks: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'INTC', 'BABA', 'JPM', 'V', 'WMT', 'DIS', 'COIN', 'SQ', 'PYPL', 'SHOP', 'UBER', 'ROKU', 'SNAP', 'TWTR', 'SPOT', 'ZM'],
    commodities: ['GOLD', 'SILVER'], // Will fetch real precious metals prices
};

let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    console.log('System initializing...');
    setupNavigation();
    initClock();
    startDataCycles();
});

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            currentView = target;

            // Update UI
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
            document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));

            const view = document.getElementById(`view-${target}`);
            if (view) {
                view.classList.remove('hidden');
                view.classList.add('active');
                updatePageTitle(target);
                fetchCurrentViewData();
            }
        });
    });
}

function updatePageTitle(view) {
    const titles = {
        'dashboard': 'Market Overview',
        'stocks': 'Stock Market',
        'commodities': 'Commodities',
        'forex': 'Foreign Exchange',
        'news': 'Global News',
        'settings': 'Settings'
    };
    document.getElementById('page-title').innerText = titles[view] || 'Market';
}

function initClock() {
    const clockEl = document.getElementById('date-display');
    const update = () => {
        const now = new Date();
        clockEl.innerHTML = `
            <div class="clock-digits">${now.toLocaleTimeString('tr-TR')}</div>
            <div class="date-text">${now.toLocaleDateString('tr-TR')}</div>
        `;
    };
    update();
    setInterval(update, 1000);
}

function startDataCycles() {
    fetchCurrentViewData();
    setInterval(() => {
        fetchCurrentViewData();
    }, 30000); // Update every 30s for real-time forex rates
}

function fetchCurrentViewData() {
    switch (currentView) {
        case 'dashboard': fetchCrypto(); break;
        case 'stocks': fetchStocks(); break;
        case 'commodities': fetchCommodities(); break;
        case 'forex': fetchForex(); break;
        case 'news': fetchNews(); break;
    }
}

async function fetchCrypto() {
    const grid = document.getElementById('crypto-grid');
    if (!grid) return;

    try {
        const ids = config.crypto.map(c => c.id).join(',');
        const res = await fetch(`/api/crypto/markets?ids=${ids}`);
        const data = await res.json();

        renderGrid(grid, data.map(coin => ({
            name: `${getCryptoIcon(coin.symbol)} ${coin.name}`,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price ? `$${coin.current_price.toLocaleString()}` : 'N/A',
            change: coin.price_change_percentage_24h || 0,
            id: coin.id
        })));
    } catch (e) {
        console.error('Crypto error', e);
        showToast('Error loading crypto data');
    }
}

async function fetchStocks() {
    const grid = document.getElementById('stocks-grid');
    if (!grid) return;

    try {
        const res = await fetch(`/api/stocks?symbols=${config.stocks.join(',')}`);
        const data = await res.json();

        renderGrid(grid, data.map(stock => ({
            name: `${getStockIcon(stock.symbol)} ${stock.symbol}`,
            symbol: stock.symbol,
            price: `$${stock.price.toFixed(2)}`,
            change: stock.change,
            id: stock.symbol
        })));
    } catch (e) {
        console.error('Stocks error', e);
    }
}

async function fetchCommodities() {
    const grid = document.getElementById('commodities-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/commodities');
        const data = await res.json();

        if (!data || data.length === 0) {
            grid.innerHTML = '<div class="loading">No commodities data available</div>';
            return;
        }

        grid.innerHTML = '';

        // Group by category
        const grouped = {};
        data.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });

        // Define category display order (gold first)
        const categoryOrder = ['gold', 'metal', 'energy', 'agriculture', 'livestock'];
        const categoryTitles = {
            'gold': '🥇 Altın / Gold',
            'metal': 'Precious Metals',
            'energy': 'Energy',
            'agriculture': 'Agriculture',
            'livestock': 'Livestock'
        };

        // Display each category in order
        categoryOrder.forEach(category => {
            if (!grouped[category]) return;

            const items = grouped[category];
            const categoryHeader = document.createElement('div');
            categoryHeader.style.gridColumn = '1 / -1';
            categoryHeader.style.fontSize = category === 'gold' ? '1.3rem' : '1.1rem';
            categoryHeader.style.fontWeight = 'bold';
            categoryHeader.style.color = category === 'gold' ? '#ffd700' : '#00e5ff';
            categoryHeader.style.marginTop = category === 'gold' ? '10px' : '20px';
            categoryHeader.style.marginBottom = '10px';
            categoryHeader.style.textShadow = category === 'gold' ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none';
            categoryHeader.textContent = categoryTitles[category] || category.charAt(0).toUpperCase() + category.slice(1);
            grid.appendChild(categoryHeader);

            if (category === 'gold') {
                const heroContainer = document.createElement('div');
                heroContainer.className = 'gold-hero-container';
                grid.appendChild(heroContainer);

                items.forEach(item => {
                    const icon = getCommodityIcon(item.name);

                    // 1. USD Card (Global)
                    const cardUSD = document.createElement('div');
                    cardUSD.className = 'gold-hero-card';
                    cardUSD.innerHTML = `
                        <div class="gold-icon-large">${icon}</div>
                        <div class="gold-label">
                            <span class="emoji-colored">🇺🇸</span> GOLD / USD
                        </div>
                        <div class="gold-value">$${item.price.toLocaleString()}</div>
                        <div class="gold-sub-value">GRAM: $${item.pricePerGram?.toFixed(2)}</div>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 10px;">GLOBAL MARKET</div>
                    `;
                    heroContainer.appendChild(cardUSD);

                    // 2. TRY Card (Turkey)
                    const cardTRY = document.createElement('div');
                    cardTRY.className = 'gold-hero-card';
                    cardTRY.style.borderColor = 'rgba(255, 61, 0, 0.3)'; // Reddish border for differentiation
                    cardTRY.innerHTML = `
                        <div class="gold-icon-large" style="color: #ff3d00">${icon}</div>
                        <div class="gold-label">
                            <span class="emoji-colored">🇹🇷</span> GRAM ALTIN
                        </div>
                        <div class="gold-value" style="color: #ff9e80">₺${item.pricePerGramTRY?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
                        <div class="gold-sub-value">Fiyat (TRY)</div>
                    `;
                    heroContainer.appendChild(cardTRY);

                    // 3. UAH Card (Ukraine)
                    const cardUAH = document.createElement('div');
                    cardUAH.className = 'gold-hero-card';
                    cardUAH.style.borderColor = 'rgba(0, 229, 255, 0.3)'; // Blue border for differentiation
                    cardUAH.innerHTML = `
                        <div class="gold-icon-large" style="color: #00e5ff">${icon}</div>
                        <div class="gold-label">
                            <span class="emoji-colored">🇺🇦</span> UAH GOLD
                        </div>
                        <div class="gold-value" style="color: #80d8ff">₴${item.pricePerGramUAH?.toLocaleString('uk-UA', { maximumFractionDigits: 0 })}</div>
                        <div class="gold-sub-value">Price (UAH)</div>
                    `;
                    heroContainer.appendChild(cardUAH);
                });
                return;
            }

            items.forEach(item => {
                const card = document.createElement('div');
                const isUp = item.change >= 0;
                card.className = `crypto-card ${isUp ? 'up' : 'down'}`;

                const icon = getCommodityIcon(item.name);
                const priceDisplay = item.pricePerGram
                    ? `$${item.pricePerGram}/g`
                    : `$${item.price}/${item.unit}`;

                card.innerHTML = `
                    <div class="card-header">
                        <span class="coin-name" style="font-size: 0.85rem"><span class="emoji-colored">${icon}</span> ${item.name}</span>
                        <span class="change-badge ${isUp ? 'change-up' : 'change-down'}">${isUp ? '▲' : '▼'} ${Math.abs(item.change || 0).toFixed(2)}%</span>
                    </div>
                    <div class="price-row">
                        <div class="coin-price" style="font-size: 1rem">${priceDisplay}</div>
                        <div class="coin-symbol" style="font-size: 0.65rem; color: #888">${item.symbol}</div>
                    </div>
                `;
                grid.appendChild(card);
            });
    } catch (e) {
        console.error('Commodities error', e);
        grid.innerHTML = '<div class="loading" style="color: #ff3d00">Failed to load commodities</div>';
    }
}


async function fetchForex() {
    const grid = document.getElementById('forex-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/forex');
        const data = await res.json();

        // Filter to show only major currency pairs in one direction
        // Show: USD/TRY, EUR/TRY, USD/UAH, EUR/UAH, GBP/TRY etc.
        // Hide: TRY/USD, TRY/EUR, UAH/USD, UAH/EUR etc.
        const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
        const targetCurrencies = ['TRY', 'UAH']; // Currencies we want to see against majors
        const filteredData = data.filter(f => {
            const [cur1, cur2] = f.symbol.split('/');
            // Show if: major/target (USD/TRY, EUR/UAH) OR major/other (not reverse)
            if (majorCurrencies.includes(cur1)) {
                return true; // Show all pairs starting with major currencies
            }
            // Hide if: target/major (TRY/USD, UAH/EUR)
            if (targetCurrencies.includes(cur1) && majorCurrencies.includes(cur2)) {
                return false;
            }
            // Show other pairs
            return !majorCurrencies.includes(cur2);
        });

        renderGrid(grid, filteredData.map(f => ({
            name: `${getPairFlags(f.symbol)} ${f.symbol}`,
            symbol: f.symbol,
            price: f.price.toFixed(4),
            change: f.change,
            id: f.symbol
        })));

        if (data.length > 0) updateConverter(data);
    } catch (e) {
        console.error('Forex error', e);
    }
}

async function fetchNews() {
    const feed = document.getElementById('global-news-feed');
    if (!feed) return;

    try {
        const res = await fetch('/api/news');
        const data = await res.json();
        feed.innerHTML = '';
        data.slice(0, 15).forEach(item => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                ${item.image ? `<img src="${item.image}" class="news-image">` : ''}
                <div class="news-content">
                    <a href="${item.url}" target="_blank" class="news-title">${item.headline}</a>
                    <div class="news-source">${item.source} • ${new Date(item.datetime * 1000).toLocaleTimeString()}</div>
                </div>
            `;
            feed.appendChild(card);
        });
    } catch (e) {
        console.error('News error', e);
    }
}

function renderGrid(container, items) {
    container.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        const isUp = item.change >= 0;
        card.className = `crypto-card ${isUp ? 'up' : 'down'}`;

        // Generate random sparkline data (7 points) - simulating 7-day trend
        // In production, this should come from API
        const sparklineData = generateSparklineData(isUp);
        const sparklineSVG = createSparklineSVG(sparklineData, isUp);

        card.innerHTML = `
            <div class="card-header">
                <span class="coin-name">${item.name}</span>
                <span class="change-badge ${isUp ? 'change-up' : 'change-down'}">${isUp ? '▲' : '▼'} ${Math.abs(item.change || 0).toFixed(2)}%</span>
            </div>
            <div class="price-row">
                <div class="coin-price">${item.price}</div>
                <div class="coin-symbol" style="font-size: 0.7rem; color: #888">${item.symbol}${item.subtitle ? ' •  ' + item.subtitle : ''}</div>
            </div>
            <div class="sparkline-container">
                ${sparklineSVG}
            </div>
        `;
        container.appendChild(card);
    });
}

// Generate simulated sparkline data (7 points)
function generateSparklineData(isUpTrend) {
    const points = [];
    let value = 50;
    for (let i = 0; i < 7; i++) {
        const change = (Math.random() - 0.5) * 10;
        value += isUpTrend ? Math.abs(change) * 0.6 : -Math.abs(change) * 0.6;
        value = Math.max(20, Math.min(80, value));
        points.push(value);
    }
    return points;
}

// Create SVG sparkline
function createSparklineSVG(data, isUp) {
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const color = isUp ? '#10b981' : '#ef4444';

    return `
        <svg width="${width}" height="${height}" style="display: block;">
            <polyline
                fill="none"
                stroke="${color}"
                stroke-width="1.5"
                points="${points}"
            />
        </svg>
    `;
}

function updateConverter(data) {
    const fromSelect = document.getElementById('conv-from');
    const toSelect = document.getElementById('conv-to');

    if (fromSelect.options.length === 0) {
        // Extract all unique currencies from the forex data
        const currencySet = new Set();
        data.forEach(item => {
            const [cur1, cur2] = item.symbol.split('/');
            currencySet.add(cur1);
            currencySet.add(cur2);
        });

        const currencies = Array.from(currencySet).sort();
        currencies.forEach(c => {
            fromSelect.add(new Option(c, c));
            toSelect.add(new Option(c, c));
        });

        // Set defaults
        fromSelect.value = 'USD';
        toSelect.value = 'TRY';
    }

    const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
    const from = fromSelect.value;
    const to = toSelect.value;

    if (from === to) {
        document.getElementById('conv-result').innerText = amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
        document.getElementById('conv-rate-info').innerText = `1 ${from} = 1.0000 ${to}`;
        return;
    }

    let rate = 0;
    // Attempt to find rate in data
    const pairSymbol = `${from}/${to}`;
    const inverseSymbol = `${to}/${from}`;

    const directMatch = data.find(d => d.symbol === pairSymbol);
    if (directMatch) {
        rate = directMatch.price;
    } else {
        const inverseMatch = data.find(d => d.symbol === inverseSymbol);
        if (inverseMatch && inverseMatch.price !== 0) {
            rate = 1 / inverseMatch.price;
        }
    }

    // Fallback: cross conversion through USD if available
    if (rate === 0 && from !== 'USD' && to !== 'USD') {
        const fromToUsd = data.find(d => d.symbol === `${from}/USD`);
        const usdToTo = data.find(d => d.symbol === `USD/${to}`);

        if (fromToUsd && usdToTo && fromToUsd.price !== 0) {
            rate = usdToTo.price / fromToUsd.price;
        } else {
            // Try inverse
            const usdToFrom = data.find(d => d.symbol === `USD/${from}`);
            const toToUsd = data.find(d => d.symbol === `${to}/USD`);
            if (usdToFrom && toToUsd && usdToFrom.price !== 0 && toToUsd.price !== 0) {
                rate = (1 / usdToFrom.price) * (1 / toToUsd.price);
            }
        }
    }

    const result = amount * rate;
    document.getElementById('conv-result').innerText = rate > 0 ? result.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : 'Rate N/A';
    document.getElementById('conv-rate-info').innerText = rate > 0 ? `1 ${from} = ${rate.toFixed(4)} ${to}` : 'Rate Unavailable';
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event listeners for converter with debouncing
const debouncedFetchForex = debounce(() => fetchForex(), 300);

document.getElementById('conv-amount')?.addEventListener('input', debouncedFetchForex);
document.getElementById('conv-from')?.addEventListener('change', debouncedFetchForex);
document.getElementById('conv-to')?.addEventListener('change', debouncedFetchForex);
document.getElementById('conv-swap')?.addEventListener('click', () => {
    const f = document.getElementById('conv-from');
    const t = document.getElementById('conv-to');
    const temp = f.value;
    f.value = t.value;
    t.value = temp;
    fetchForex();
});





