/**
 * CoinTelegraph Localization v4.0
 */

const translations = {
    tr: {
        'dashboard': 'Piyasa Özeti',
        'stocks': 'Borsa / Hisseler',
        'commodities': 'Emtialar',
        'forex': 'Döviz / Forex',
        'news': 'Dünya Haberleri',
        'settings': 'Ayarlar',
        'market_overview': 'Piyasa Özeti',
        'global_stocks': 'Küresel Hisseler',
        'commodity_prices': 'Emtia Fiyatları',
        'forex_rates': 'Döviz Kurları',
        'breaking_news': 'Son Dakika Haberler',
        'preferences': 'Uygulama Ayarları',
        'lang_label': 'Dil Seçimi',
        'converter': 'Döviz Çevirici',
        'amount': 'Miktar',
        'from': 'Kaynak',
        'to': 'Hedef',
        'swap': 'Değiştir',
        'result': 'Sonuç',
        'gold_title': '🥇 Altın / Gold',
        'metals': 'Değerli Metaller',
        'energy': 'Enerji',
        'agri': 'Tarım',
        'livestock': 'Hayvancılık',
        'gram_altin': 'GRAM ALTIN',
        'viewing': 'görüntüleniyor'
    },
    en: {
        'dashboard': 'Market Overview',
        'stocks': 'Stock Market',
        'commodities': 'Commodities',
        'forex': 'Foreign Exchange',
        'news': 'Global News',
        'settings': 'Settings',
        'market_overview': 'Market Overview',
        'global_stocks': 'Global Stocks',
        'commodity_prices': 'Commodity Prices',
        'forex_rates': 'Forex Rates',
        'breaking_news': 'Breaking News',
        'preferences': 'Preferences',
        'lang_label': 'Language',
        'converter': 'Currency Converter',
        'amount': 'Amount',
        'from': 'From',
        'to': 'To',
        'swap': 'Swap',
        'result': 'Result',
        'gold_title': '🥇 Gold',
        'metals': 'Precious Metals',
        'energy': 'Energy',
        'agri': 'Agriculture',
        'livestock': 'Livestock',
        'gram_altin': 'GRAM GOLD',
        'viewing': 'viewing'
    },
    ua: {
        'dashboard': 'Огляд ринку',
        'stocks': 'Фондовий ринок',
        'commodities': 'Товари',
        'forex': 'Форекс',
        'news': 'Новини світу',
        'settings': 'Налаштування',
        'market_overview': 'Огляд ринку',
        'global_stocks': 'Глобальні акції',
        'commodity_prices': 'Ціни на товари',
        'forex_rates': 'Курси валют',
        'breaking_news': 'Останні новини',
        'preferences': 'Налаштування',
        'lang_label': 'Вибір мови',
        'converter': 'Конвертер валют',
        'amount': 'Сума',
        'from': 'З',
        'to': 'В',
        'swap': 'Обміняти',
        'result': 'Результат',
        'gold_title': '🥇 Золото',
        'metals': 'Дорогоцінні метали',
        'energy': 'Енергетика',
        'agri': 'Сільське господарство',
        'livestock': 'Тваринництво',
        'gram_altin': 'ГРАМ ЗОЛОТА',
        'viewing': 'перегляд'
    },
    de: {
        'dashboard': 'Marktübersicht',
        'stocks': 'Aktienmarkt',
        'commodities': 'Rohstoffe',
        'forex': 'Devisen',
        'news': 'Weltnachrichten',
        'settings': 'Einstellungen',
        'market_overview': 'Marktübersicht',
        'global_stocks': 'Globale Aktien',
        'commodity_prices': 'Rohstoffpreise',
        'forex_rates': 'Wechselkurse',
        'breaking_news': 'Nachrichten',
        'preferences': 'Einstellungen',
        'lang_label': 'Sprachauswahl',
        'converter': 'Währungsrechner',
        'amount': 'Betrag',
        'from': 'Von',
        'to': 'Nach',
        'swap': 'Tauschen',
        'result': 'Ergebnis',
        'gold_title': '🥇 Gold',
        'metals': 'Edelmetalle',
        'energy': 'Energie',
        'agri': 'Landwirtschaft',
        'livestock': 'Viehbestand',
        'gram_altin': 'GRAMM GOLD',
        'viewing': 'wird angezeigt'
    }
};

function t(key) {
    const lang = localStorage.getItem('app_lang') || 'en';
    return translations[lang][key] || key;
}

function updateUILanguage() {
    try {
        const lang = localStorage.getItem('app_lang') || 'en';
        document.documentElement.lang = lang;

        // Update Page Title Mapping
        const viewTitles = {
            'dashboard': 'market_overview',
            'stocks': 'global_stocks',
            'commodities': 'commodity_prices',
            'forex': 'forex_rates',
            'news': 'breaking_news',
            'settings': 'preferences'
        };

        const currentView = (typeof State !== 'undefined') ? State.currentView : 'dashboard';
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.innerText = t(viewTitles[currentView]);

        // Navigation Sync
        Object.keys(viewTitles).forEach(view => {
            const navSpan = document.getElementById(`nav-${view}`);
            if (navSpan) navSpan.innerText = t(view);
        });

        // Other static labels
        const staticMap = {
            'conv-title': 'converter',
            'label-lang': 'lang_label',
            'set-title': 'preferences'
        };

        Object.entries(staticMap).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = t(key);
        });

    } catch (e) {
        console.warn('UI Language Sync non-fatal error:', e);
    }
}
