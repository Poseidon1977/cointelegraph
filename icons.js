// Image URL Generators for various assets

const countryCodes = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp', 'CHF': 'ch',
    'AUD': 'au', 'CAD': 'ca', 'NZD': 'nz', 'TRY': 'tr', 'UAH': 'ua',
    'CNY': 'cn', 'INR': 'in', 'BRL': 'br', 'CZK': 'cz', 'DKK': 'dk',
    'HKD': 'hk', 'HUF': 'hu', 'IDR': 'id', 'ILS': 'il', 'ISK': 'is',
    'KRW': 'kr', 'MXN': 'mx', 'MYR': 'my', 'NOK': 'no', 'PHP': 'ph',
    'PLN': 'pl', 'RON': 'ro', 'SEK': 'se', 'SGD': 'sg', 'THB': 'th',
    'ZAR': 'za', 'RUB': 'ru', 'ARS': 'ar', 'CLP': 'cl', 'COP': 'co',
    'PEN': 'pe', 'EGP': 'eg', 'NGN': 'ng', 'KES': 'ke', 'SAR': 'sa',
    'AED': 'ae', 'QAR': 'qa', 'KWD': 'kw', 'BHD': 'bh', 'PKR': 'pk',
    'BDT': 'bd', 'VND': 'vn', 'TWD': 'tw', 'BGN': 'bg', 'HRK': 'hr',
    'LKR': 'lk', 'MAD': 'ma', 'MUR': 'mu', 'NPR': 'np', 'GHS': 'gh',
    'UGX': 'ug', 'DZD': 'dz', 'TND': 'tn', 'KZT': 'kz', 'UZS': 'uz',
    'AZN': 'az', 'GEL': 'ge', 'AMD': 'am', 'BYN': 'by'
};

const commodityIconUrls = {
    'Gold': 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png',
    'Silver': 'https://cdn-icons-png.flaticon.com/512/3699/3699566.png',
    'Platinum': 'https://cdn-icons-png.flaticon.com/512/10777/10777271.png',
    'Palladium': 'https://cdn-icons-png.flaticon.com/512/2822/2822765.png',
    'Copper': 'https://cdn-icons-png.flaticon.com/512/5752/5752925.png',
    'Crude Oil (WTI)': 'https://cdn-icons-png.flaticon.com/512/2933/2933909.png',
    'Brent Oil': 'https://cdn-icons-png.flaticon.com/512/2228/2228815.png',
    'Natural Gas': 'https://cdn-icons-png.flaticon.com/512/757/757827.png',
    'Heating Oil': 'https://cdn-icons-png.flaticon.com/512/7996/7996162.png',
    'Gasoline': 'https://cdn-icons-png.flaticon.com/512/2311/2311451.png',
    'Wheat': 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
    'Corn': 'https://cdn-icons-png.flaticon.com/512/2635/2635967.png',
    'Soybeans': 'https://cdn-icons-png.flaticon.com/512/4715/4715025.png',
    'Coffee': 'https://cdn-icons-png.flaticon.com/512/3055/3055375.png',
    'Sugar': 'https://cdn-icons-png.flaticon.com/512/3081/3081907.png',
    'Cotton': 'https://cdn-icons-png.flaticon.com/512/2867/2867204.png',
    'Cocoa': 'https://cdn-icons-png.flaticon.com/512/7395/7395662.png',
    'Rice': 'https://cdn-icons-png.flaticon.com/512/2933/2933969.png',
    'Live Cattle': 'https://cdn-icons-png.flaticon.com/512/1998/1998610.png',
    'Lean Hogs': 'https://cdn-icons-png.flaticon.com/512/2117/2117215.png'
};

// Crypto ID mapping for CoinGecko images
const cryptoIds = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin',
    'XRP': 'ripple', 'ADA': 'cardano', 'DOGE': 'dogecoin', 'DOT': 'polkadot',
    'MATIC': 'matic-network', 'LINK': 'chainlink', 'UNI': 'uniswap', 'AVAX': 'avalanche-2',
    'ATOM': 'cosmos', 'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'SHIB': 'shiba-inu',
    'TRX': 'tron', 'NEAR': 'near', 'LEO': 'leo-token', 'DAI': 'dai', 'APT': 'aptos',
    'ICP': 'internet-computer', 'XLM': 'stellar', 'XMR': 'monero', 'EOS': 'eos',
    'VET': 'vechain', 'ALGO': 'algorand', 'XTZ': 'tezos', 'THETA': 'theta-token',
    'FIL': 'filecoin', 'HBAR': 'hedera-hashgraph', 'EGLD': 'elrond-erd-2',
    'FTM': 'fantom', 'SAND': 'the-sandbox', 'MANA': 'decentraland',
    'AXS': 'axie-infinity', 'ENJ': 'enjincoin', 'CHZ': 'chiliz',
    'FLOW': 'flow', 'AAVE': 'aave', 'MKR': 'maker', 'COMP': 'compound-governance-token'
};

// Get Flag Image URL
function getCurrencyFlagUrl(currencyCode) {
    if (!currencyCode) return 'https://flagcdn.com/w40/un.png';
    const code = countryCodes[currencyCode.toUpperCase()];
    if (!code) return 'https://flagcdn.com/w40/un.png'; // Fallback UN flag
    return `https://flagcdn.com/w40/${code}.png`;
}

// Get Commodity Icon URL
function getCommodityIconUrl(name) {
    return commodityIconUrls[name] || 'https://cdn-icons-png.flaticon.com/512/1792/1792947.png'; // Box fallback
}

// Get Crypto Logo URL
function getCryptoLogoUrl(symbol) {
    const id = cryptoIds[symbol?.toUpperCase()];
    if (id) {
        return `https://cryptologos.cc/logos/${id.toLowerCase()}-logo.png`;
    }
    // Generic crypto icon fallback
    return 'https://cdn-icons-png.flaticon.com/512/1213/1213079.png';
}

// Get Stock Logo URL
function getStockLogoUrl(symbol) {
    // Using Clearbit or generic financial API. Parqet is also good.
    return `https://assets.parqet.com/logos/symbol/${symbol}?format=png`;
}

// Get Pair Flags HTML (e.g. USD/TRY)
function getPairFlagsHtml(pairSymbol) {
    const parts = pairSymbol.split('/');
    if (parts.length === 2) {
        const url1 = getCurrencyFlagUrl(parts[0]);
        const url2 = getCurrencyFlagUrl(parts[1]);
        return `
            <div class="pair-flags">
                <img src="${url1}" class="flag-icon-pair" alt="${parts[0]}">
                <img src="${url2}" class="flag-icon-pair" alt="${parts[1]}">
            </div>
        `;
    }
    return '';
}

// NEW FUNCTIONS - Return HTML img tags instead of emojis

// Get Crypto Icon as HTML img tag
function getCryptoIcon(symbol, overrideUrl) {
    const url = overrideUrl || getCryptoLogoUrl(symbol);
    return `<img src="${url}" class="coin-logo" alt="${symbol}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1213/1213079.png'">`;
}

// Get Stock Icon as HTML img tag
function getStockIcon(symbol) {
    const url = getStockLogoUrl(symbol);
    return `<img src="${url}" class="coin-logo" alt="${symbol}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2721/2721688.png'">`;
}

// Get Commodity Icon as HTML img tag
function getCommodityIcon(name) {
    const url = getCommodityIconUrl(name);
    return `<img src="${url}" class="coin-logo" alt="${name}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1792/1792947.png'">`;
}

// Get Pair Flags as HTML img tags
function getPairFlags(pairSymbol) {
    if (!pairSymbol || typeof pairSymbol !== 'string') return '';
    const parts = pairSymbol.split('/');
    if (parts.length === 2) {
        const url1 = getCurrencyFlagUrl(parts[0]);
        const url2 = getCurrencyFlagUrl(parts[1]);
        return `<img src="${url1}" class="flag-icon" alt="${parts[0]}" onerror="this.src='https://flagcdn.com/w40/un.png'"><img src="${url2}" class="flag-icon" alt="${parts[1]}" onerror="this.src='https://flagcdn.com/w40/un.png'">`;
    }
    return '';
}

