const config = {
    crypto: [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
        { id: 'solana', name: 'Solana', symbol: 'SOL' },
        { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
        { id: 'ripple', name: 'XRP', symbol: 'XRP' },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
        { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' }
    ],
    stocks: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX'],
    commodities: ['GLD', 'SLV', 'UNG', 'USO'], // ETF equivalents for Gold, Silver, Natural Gas, Oil
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
    }, 30000); // Update every 30s
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
            name: coin.name,
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

        renderGrid(grid, data.map(s => ({
            name: s.symbol,
            symbol: s.symbol,
            price: `$${s.price.toFixed(2)}`,
            change: s.change,
            id: s.symbol
        })));
    } catch (e) {
        console.error('Stocks error', e);
    }
}

async function fetchCommodities() {
    const grid = document.getElementById('commodities-grid');
    if (!grid) return;

    try {
        const res = await fetch(`/api/stocks?symbols=${config.commodities.join(',')}`);
        const data = await res.json();

        const names = { 'GLD': 'Gold', 'SLV': 'Silver', 'UNG': 'Nat Gas', 'USO': 'Oil' };

        renderGrid(grid, data.map(s => ({
            name: names[s.symbol] || s.symbol,
            symbol: s.symbol,
            price: `$${s.price.toFixed(2)}`,
            change: s.change,
            id: s.symbol
        })));
    } catch (e) {
        console.error('Commodities error', e);
    }
}

async function fetchForex() {
    const grid = document.getElementById('forex-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/forex');
        const data = await res.json();

        renderGrid(grid, data.map(f => ({
            name: f.symbol,
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
        card.innerHTML = `
            <div class="card-header">
                <span class="coin-name">${item.name}</span>
                <span class="change-badge ${isUp ? 'change-up' : 'change-down'}">${isUp ? '▲' : '▼'} ${Math.abs(item.change || 0).toFixed(2)}%</span>
            </div>
            <div class="price-row">
                <div class="coin-price">${item.price}</div>
                <div class="coin-symbol" style="font-size: 0.7rem; color: #888">${item.symbol}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateConverter(data) {
    const fromSelect = document.getElementById('conv-from');
    const toSelect = document.getElementById('conv-to');

    if (fromSelect.options.length === 0) {
        const currencies = ['USD', 'EUR', 'TRY', 'GBP', 'JPY'];
        currencies.forEach(c => {
            fromSelect.add(new Option(c, c));
            toSelect.add(new Option(c, c));
        });
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

    // Fallback if not found in forex data but we have cross rates
    if (rate === 0) {
        // Try cross conversion through USD if available
        const usdToFrom = data.find(d => d.symbol === `USD/${from}`);
        const usdToTo = data.find(d => d.symbol === `USD/${to}`);

        if (usdToFrom && usdToTo && usdToFrom.price !== 0) {
            rate = usdToTo.price / usdToFrom.price;
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

// Event listeners for converter
document.getElementById('conv-amount')?.addEventListener('input', () => fetchForex());
document.getElementById('conv-from')?.addEventListener('change', () => fetchForex());
document.getElementById('conv-to')?.addEventListener('change', () => fetchForex());
document.getElementById('conv-swap')?.addEventListener('click', () => {
    const f = document.getElementById('conv-from');
    const t = document.getElementById('conv-to');
    const temp = f.value;
    f.value = t.value;
    t.value = temp;
    fetchForex();
});
