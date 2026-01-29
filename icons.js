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
    'TRX': 'tron', 'MATIC': 'polygon', 'LINK': 'chainlink', 'AVAX': 'avalanche',
    'SHIB': 'shiba-inu', 'TON': 'toncoin', 'XLM': 'stellar', 'SUI': 'sui',
    'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near-protocol', 'APT': 'aptos',
    'ATOM': 'cosmos', 'FTM': 'fantom', 'OP': 'optimism', 'ARB': 'arbitrum',
    'RENDER': 'render-token', 'ICP': 'internet-computer', 'UNI': 'uniswap',
    'ETC': 'ethereum-classic', 'PEPE': 'pepe', 'BONK': 'bonk', 'FLOKI': 'floki',
    'SEI': 'sei-network', 'TIA': 'celestia', 'XMR': 'monero', 'OKB': 'okb', 'KAS': 'kaspa'
};

// Generic URL Generator Wrapper
function createImgHtml(url, className, fallback) {
    return `<img src="${url}" class="${className}" onerror="this.src='${fallback}';this.onerror=null;" alt="icon">`;
}

function getCryptoIcon(symbol, overrideUrl) {
    const sym = symbol?.toUpperCase();
    const id = CRYPTO_MAP[sym];

    // Use stable professional logos source primarily
    const url = overrideUrl || (id ? `https://cryptologos.cc/logos/${id}-${sym.toLowerCase()}-logo.png?v=035` : ICON_FALLBACKS.crypto);

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
