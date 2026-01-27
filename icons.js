// Currency flag emojis and commodity icons mappings
const currencyFlags = {
    'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
    'CHF': '🇨🇭', 'AUD': '🇦🇺', 'CAD': '🇨🇦', 'NZD': '🇳🇿',
    'TRY': '🇹🇷', 'UAH': '🇺🇦', 'CNY': '🇨🇳', 'INR': '🇮🇳',
    'BRL': '🇧🇷', 'CZK': '🇨🇿', 'DKK': '🇩🇰', 'HKD': '🇭🇰',
    'HUF': '🇭🇺', 'IDR': '🇮🇩', 'ILS': '🇮🇱', 'ISK': '🇮🇸',
    'KRW': '🇰🇷', 'MXN': '🇲🇽', 'MYR': '🇲🇾', 'NOK': '🇳🇴',
    'PHP': '🇵🇭', 'PLN': '🇵🇱', 'RON': '🇷🇴', 'SEK': '🇸🇪',
    'SGD': '🇸🇬', 'THB': '🇹🇭', 'ZAR': '🇿🇦', 'RUB': '🇷🇺',
    'ARS': '🇦🇷', 'CLP': '🇨🇱', 'COP': '🇨🇴', 'PEN': '🇵🇪',
    'EGP': '🇪🇬', 'NGN': '🇳🇬', 'KES': '🇰🇪', 'SAR': '🇸🇦',
    'AED': '🇦🇪', 'QAR': '🇶🇦', 'KWD': '🇰🇼', 'BHD': '🇧🇭'
};

const commodityIcons = {
    'Gold': '🥇', 'Silver': '🥈', 'Platinum': '⚪', 'Palladium': '⚫', 'Copper': '🟠',
    'Crude Oil (WTI)': '🛢️', 'Brent Oil': '🛢️', 'Natural Gas': '🔥',
    'Heating Oil': '🔥', 'Gasoline': '⛽',
    'Wheat': '🌾', 'Corn': '🌽', 'Soybeans': '🫘', 'Coffee': '☕',
    'Sugar': '🍬', 'Cotton': '🧵', 'Cocoa': '🍫', 'Rice': '🍚',
    'Live Cattle': '🐄', 'Lean Hogs': '🐷'
};

// Get currency flag for display
function getCurrencyFlag(currencyCode) {
    return currencyFlags[currencyCode] || '💱';
}

// Get commodity icon for display
function getCommodityIcon(commodityName) {
    return commodityIcons[commodityName] || '📦';
}

// Get flag from currency pair (e.g., "USD/TRY" -> "🇺🇸/🇹🇷")
function getPairFlags(pairSymbol) {
    const [base, quote] = pairSymbol.split('/');
    return `${getCurrencyFlag(base)}${getCurrencyFlag(quote)}`;
}
