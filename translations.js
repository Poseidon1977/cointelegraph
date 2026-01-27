const translations = {
    tr: {
        'dashboard': 'Piyasa Özeti',
        'stocks': 'Borsa / Hisseler',
        'commodities': 'Emtialar',
        'forex': 'Döviz / Forex',
        'news': 'Dünya Haberleri',
        'settings': 'Ayarlar',
        'crypto_title': 'Kripto Para Piyasası',
        'stocks_title': 'Global Hisse Senetleri',
        'commodities_title': 'Emtia Fiyatları',
        'forex_title': 'Döviz Kurları',
        'news_title': 'Son Dakika Haberler',
        'settings_title': 'Uygulama Ayarları',
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
        'global_market': 'KÜRESEL PİYASA'
    },
    en: {
        'dashboard': 'Market Overview',
        'stocks': 'Stock Market',
        'commodities': 'Commodities',
        'forex': 'Foreign Exchange',
        'news': 'Global News',
        'settings': 'Settings',
        'crypto_title': 'Crypto Market',
        'stocks_title': 'Global Stocks',
        'commodities_title': 'Commodity Prices',
        'forex_title': 'Forex Rates',
        'news_title': 'Breaking News',
        'settings_title': 'Settings',
        'lang_label': 'Language Selection',
        'converter': 'Currency Converter',
        'amount': 'Amount',
        'from': 'From',
        'to': 'To',
        'swap': 'Swap',
        'result': 'Result',
        'gold_title': '🥇 gold',
        'metals': 'Precious Metals',
        'energy': 'Energy',
        'agri': 'Agriculture',
        'livestock': 'Livestock',
        'gram_altin': 'GRAM GOLD',
        'global_market': 'GLOBAL MARKET'
    },
    ua: {
        'dashboard': 'Огляд ринку',
        'stocks': 'Фондовий ринок',
        'commodities': 'Товари',
        'forex': 'Форекс',
        'news': 'Новини',
        'settings': 'Налаштування',
        'crypto_title': 'Крипторинок',
        'stocks_title': 'Акції',
        'commodities_title': 'Ціни на товари',
        'forex_title': 'Курси валют',
        'news_title': 'Останні новини',
        'settings_title': 'Налаштування',
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
        'global_market': 'ГЛОБАЛЬНИЙ РИНОК'
    },
    de: {
        'dashboard': 'Marktübersicht',
        'stocks': 'Aktienmarkt',
        'commodities': 'Rohstoffe',
        'forex': 'Devisen',
        'news': 'Nachrichten',
        'settings': 'Einstellungen',
        'crypto_title': 'Kryptomarkt',
        'stocks_title': 'Aktien',
        'commodities_title': 'Rohstoffpreise',
        'forex_title': 'Wechselkurse',
        'news_title': 'Nachrichten',
        'settings_title': 'Einstellungen',
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
        'global_market': 'GLOBALER MARKT'
    }
};

function t(key) {
    const lang = localStorage.getItem('app_lang') || 'en';
    return translations[lang][key] || key;
}

function updateUILanguage() {
    const lang = localStorage.getItem('app_lang') || 'en';

    // Update body class for potential CSS styling per lang
    document.body.className = `lang-${lang}`;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        const target = item.dataset.target;
        const textSpan = item.querySelector('span:not(.nav-icon)');
        if (textSpan) textSpan.innerText = t(target);
    });

    // Update headers and labels
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const currentView = window.currentView || 'dashboard';
        pageTitle.innerText = t(currentView);
    }

    // Converter labels
    const convLabels = {
        'conv-title-text': 'converter',
        'label-amount': 'amount',
        'label-from': 'from',
        'label-to': 'to',
        'conv-swap': 'swap',
        'conv-result-label': 'result'
    };

    for (const [id, key] of Object.entries(convLabels)) {
        const el = document.getElementById(id);
        if (el) el.innerText = t(key);
    }

    // Refresh current view data to apply translations in grids
    if (typeof fetchCurrentViewData === 'function') {
        fetchCurrentViewData();
    }
}
