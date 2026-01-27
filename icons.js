// Comprehensive Currency flag emojis mapping (ISO 4217)
const currencyFlags = {
    'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵', 'CHF': '🇨🇭',
    'AUD': '🇦🇺', 'CAD': '🇨🇦', 'NZD': '🇳🇿', 'TRY': '🇹🇷', 'UAH': '🇺🇦',
    'CNY': '🇨🇳', 'INR': '🇮🇳', 'BRL': '🇧🇷', 'CZK': '🇨🇿', 'DKK': '🇩🇰',
    'HKD': '🇭🇰', 'HUF': '🇭🇺', 'IDR': '🇮🇩', 'ILS': '🇮🇱', 'ISK': '🇮🇸',
    'KRW': '🇰🇷', 'MXN': '🇲🇽', 'MYR': '🇲🇾', 'NOK': '🇳🇴', 'PHP': '🇵🇭',
    'PLN': '🇵🇱', 'RON': '🇷🇴', 'SEK': '🇸🇪', 'SGD': '🇸🇬', 'THB': '🇹🇭',
    'ZAR': '🇿🇦', 'RUB': '🇷🇺', 'ARS': '🇦🇷', 'CLP': '🇨🇱', 'COP': '🇨🇴',
    'PEN': '🇵🇪', 'EGP': '🇪🇬', 'NGN': '🇳🇬', 'KES': '🇰🇪', 'SAR': '🇸🇦',
    'AED': '🇦🇪', 'QAR': '🇶🇦', 'KWD': '🇰🇼', 'BHD': '🇧🇭', 'PKR': '🇵🇰',
    'BDT': '🇧🇩', 'VND': '🇻🇳', 'THB': '🇹🇭', 'TWD': '🇹🇼', 'RON': '🇷🇴',
    'BGN': '🇧🇬', 'HRK': '🇭🇷', 'ISK': '🇮🇸', 'LKR': '🇱🇰', 'MAD': '🇲🇦',
    'MUR': '🇲🇺', 'NPR': '🇳🇵', 'PEN': '🇵🇪', 'PHP': '🇵🇭', 'THB': '🇹🇭',
    'ZAR': '🇿🇦', 'GHS': '🇬🇭', 'UGX': '🇺🇬', 'DZD': '🇩🇿', 'TND': '🇹🇳',
    'MAD': '🇲🇦', 'KZT': '🇰🇿', 'UZS': '🇺🇿', 'AZN': '🇦🇿', 'GEL': '🇬🇪',
    'AMD': '🇦🇲', 'BYN': '🇧🇾'
};

const commodityIcons = {
    'Gold': '🥇', 'Silver': '🥈', 'Platinum': '💿', 'Palladium': '🌑', 'Copper': '🥉',
    'Crude Oil (WTI)': '⛽', 'Brent Oil': '🛢️', 'Natural Gas': '🔥',
    'Heating Oil': '🌡️', 'Gasoline': '⚡',
    'Wheat': '🌾', 'Corn': '🌽', 'Soybeans': '🌱', 'Coffee': '☕',
    'Sugar': '🍬', 'Cotton': '🧶', 'Cocoa': '🍫', 'Rice': '🍚',
    'Live Cattle': '🐂', 'Lean Hogs': '🐖'
};

const cryptoIcons = {
    'BTC': '₿', 'ETH': 'Ξ', 'SOL': '☀', 'BNB': '🔶',
    'XRP': '✖', 'ADA': '₳', 'DOGE': '🐕', 'DOT': '🟢',
    'MATIC': '🟣', 'LINK': '🔗', 'UNI': '🦄', 'AVAX': '🔺',
    'ATOM': '⚛', 'LTC': 'Ł', 'BCH': '฿', 'SHIB': '🦊',
    'TRX': '💎', 'NEAR': 'Ⓝ', 'LEO': '🦁', 'DAI': '◈'
};

const stockIcons = {
    'AAPL': '🍏', 'TSLA': '🚗', 'AMZN': '📦', 'MSFT': '🖥️',
    'GOOGL': '🌈', 'NVDA': '🎮', 'META': '♾️', 'BRK.B': '🏠',
    'JPM': '🏢', 'V': '💳', 'JNJ': '🏥', 'WMT': '🏬',
    'PG': '🧼', 'MA': '💵', 'HD': '🏠', 'DIS': '🎬',
    'BAC': '🏦', 'NFLX': '🍿', 'ADBE': '🖌️', 'CRM': '☁️'
};

// Get currency flag for display
function getCurrencyFlag(currencyCode) {
    return currencyFlags[currencyCode] || '🏳️';
}

// Get commodity icon for display
function getCommodityIcon(commodityName) {
    return commodityIcons[commodityName] || '📦';
}

// Get crypto icon for display
function getCryptoIcon(symbol) {
    return cryptoIcons[symbol.toUpperCase()] || '💰';
}

// Get stock icon for display
function getStockIcon(symbol) {
    return stockIcons[symbol.toUpperCase()] || '📈';
}

// Get flag from currency pair (e.g., "USD/TRY" -> "🇺🇸/🇹🇷")
function getPairFlags(pairSymbol) {
    const parts = pairSymbol.split('/');
    if (parts.length === 2) {
        return `${getCurrencyFlag(parts[0])}${getCurrencyFlag(parts[1])}`;
    }
    return '🏳️';
}
