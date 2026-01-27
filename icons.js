/**
 * CoinTelegraph Icon & Media Generator v4.0
 * Resilient icon handling with multi-layer fallbacks
 */

const ICON_FALLBACKS = {
    crypto: 'https://cdn-icons-png.flaticon.com/512/1213/1213079.png',
    stock: 'https://cdn-icons-png.flaticon.com/512/2721/2721688.png',
    commodity: 'https://cdn-icons-png.flaticon.com/512/1792/1792947.png',
    flag: 'https://flagcdn.com/w40/un.png'
};

const CRYPTO_MAP = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin',
    'XRP': 'ripple', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'DOT': 'polkadot',
    'TRX': 'tron', 'MATIC': 'matic-network', 'LINK': 'chainlink', 'AVAX': 'avalanche-2'
};

// Generic URL Generator Wrapper
function createImgHtml(url, className, fallback) {
    return `<img src="${url}" class="${className}" onerror="this.src='${fallback}';this.onerror=null;" alt="icon">`;
}

function getCryptoIcon(symbol, overrideUrl) {
    const id = CRYPTO_MAP[symbol?.toUpperCase()];
    const url = overrideUrl || (id ? `https://assets.coingecko.com/coins/images/1/small/bitcoin.png` : ICON_FALLBACKS.crypto);
    // Note: The specific coingecko URL above is just a template, in production overrideUrl from API is preferred.
    return createImgHtml(url, 'asset-logo', ICON_FALLBACKS.crypto);
}

function getStockIcon(symbol) {
    const url = `https://assets.parqet.com/logos/symbol/${symbol}?format=png`;
    return createImgHtml(url, 'asset-logo', ICON_FALLBACKS.stock);
}

function getCommodityIcon(name) {
    const commodityMap = {
        'Gold': 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png',
        'Silver': 'https://cdn-icons-png.flaticon.com/512/3699/3699566.png',
        'Crude Oil (WTI)': 'https://cdn-icons-png.flaticon.com/512/2933/2933909.png',
        'Brent Oil': 'https://cdn-icons-png.flaticon.com/512/2228/2228815.png'
    };
    const url = commodityMap[name] || ICON_FALLBACKS.commodity;
    return createImgHtml(url, 'asset-logo', ICON_FALLBACKS.commodity);
}

function getPairFlags(pairSymbol) {
    if (!pairSymbol || typeof pairSymbol !== 'string') return '';
    const parts = pairSymbol.split('/');
    if (parts.length === 2) {
        const f1 = parts[0].toLowerCase().substring(0, 2);
        const f2 = parts[1].toLowerCase().substring(0, 2);

        // Correct mappings for major currencies
        const map = { 'us': 'us', 'eu': 'eu', 'gb': 'gb', 'tr': 'tr', 'ua': 'ua', 'jp': 'jp' };

        const url1 = `https://flagcdn.com/w40/${map[f1] || f1}.png`;
        const url2 = `https://flagcdn.com/w40/${map[f2] || f2}.png`;

        return `
            <div class="flag-pair">
                ${createImgHtml(url1, 'flag-sm', ICON_FALLBACKS.flag)}
                ${createImgHtml(url2, 'flag-sm', ICON_FALLBACKS.flag)}
            </div>
        `;
    }
    return '';
}
