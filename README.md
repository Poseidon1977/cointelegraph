# 📊 Crypto Tracker - Real-Time Market Dashboard

Gerçek zamanlı kripto para, hisse senedi, döviz ve emtia takip sistemi.

## 🚀 Özellikler

- **💰 Kripto Takibi** - 20+ popüler kripto para anlık fiyatları
- **📈 Hisse Senedi** - Büyük şirketlerin (AAPL, TSLA, GOOGL, vb.) hisse fiyatları
- **💱 160+ Para Birimi** - Gerçek zamanlı döviz kurları (UAH 🇺🇦 dahil)
- **🥇 19 Emtia** - Altın (TRY₺ ve UAH₴ fiyatları ile), gümüş, petrol, tarım ürünleri
- **🚩 Para Birimi Bayrakları** - Her currency için orijinal bayrak emojileri
- **🎨 Emtia İkonları** - Görsel icon'lar (🥇🛢️🌾☕🐄)
- **🔄 Akıllı Döviz Çevirici** - 160+ para birimi arası çeviri
- **📰 Finansal Haberler** - Güncel piyasa haberleri
- **⚡ Gerçek Zamanlı** - 30 saniyede bir otomatik güncelleme
- **🌙 Karanlık Tema** - Modern, göz dostu arayüz

## 🛠️ Teknolojiler

### Backend
- **Node.js** + Express
- **Axios** - API istekleri
- **dotenv** - Ortam değişkenleri
- **CORS** - Cross-origin desteği
- **Compression** - GZIP sıkıştırma

### Frontend
- **Vanilla JavaScript** - Hafif ve hızlı
- **CSS3** - Modern tasarım
- **HTML5** - Semantic markup

### API'ler
- **CoinGecko** - Kripto para verileri
- **Finnhub** - Hisse senedi ve haberler
- **Frankfurter** - Döviz kurları (ücretsiz)
- **Open ExchangeRate** - Fallback forex API

## 📦 Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/[kullanici-adiniz]/crypto-tracker.git
cd crypto-tracker
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın
`.env` dosyası oluşturun:
```env
PORT=3000
FINNHUB_API_KEY=your_finnhub_api_key_here
```

**Finnhub API Key Almak:**
1. [finnhub.io](https://finnhub.io) adresine gidin
2. Ücretsiz hesap oluşturun
3. API key'inizi kopyalayın

### 4. Sunucuyu Başlatın
```bash
npm start
```

Uygulama **http://localhost:3000** adresinde çalışacaktır.

## 🌐 Railway'e Deploy

### Railway ile Hızlı Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Manuel Deployment

1. [railway.app](https://railway.app) hesabı oluşturun
2. "New Project" → "Deploy from GitHub repo"
3. Bu repository'yi seçin
4. Environment Variables ekleyin:
   - `FINNHUB_API_KEY`: Finnhub API anahtarınız
5. Deploy edin!

Railway otomatik olarak:
- ✅ Dependencies yükler
- ✅ Port atar
- ✅ HTTPS sertifikası oluşturur
- ✅ Otomatik deploy yapar (her push'ta)

## 📁 Proje Yapısı

```
crypto-tracker/
├── server.js           # Express backend
├── app.js              # Frontend logic
├── index.html          # Ana sayfa
├── style.css           # Stiller
├── package.json        # Dependencies
├── .env                # Ortam değişkenleri (git'e dahil değil)
├── .gitignore          # Git ignore
└── README.md           # Bu dosya
```

## 🔧 API Endpoints

### Kripto
```
GET /api/crypto/markets?ids=bitcoin,ethereum,...
```

### Hisse Senedi
```
GET /api/stocks?symbols=AAPL,TSLA,...
```

### Döviz
```
GET /api/forex
```
41+ para birimi çifti döner (USD/TRY, EUR/USD, vb.)

### Emtia
```
GET /api/commodities
```
19 emtia (altın, gümüş, petrol, tarım ürünleri)

### Haberler
```
GET /api/news
```

## 💡 Kullanım

1. **Dashboard** - Ana sayfa, tüm kripto paraları görüntüler
2. **Stocks** - Hisse senedi fiyatları
3. **Commodities** - Emtia fiyatları (kategorilere göre)
4. **Forex** - Döviz kurları + dönüştürücü
5. **News** - Güncel finansal haberler
6. **Settings** - Ayarlar (yakında)

### Döviz Çevirici
- 160+ para birimi desteklenir
- Gerçek zamanlı kurlar
- Akıllı çapraz kur hesaplama
- Swap butonu ile hızlı değişim

## 🔄 Güncelleme Sıklığı

- **Forex**: 30 saniye (cache)
- **Kripto**: 30 saniye
- **Hisse Senedi**: 30 saniye
- **Emtia**: 30 saniye (mock data - sabit fiyat simülasyonu)
- **Haberler**: 2 dakika

## 🚨 Önemli Notlar

- **API Limitleri**: Ücretsiz tier'lar günlük limit içerir
- **Forex**: Frankfurter API tamamen ücretsiz, limit yok
- **Commodities**: Mock data kullanıyor (simülasyon)
- **Finnhub**: Ücretsiz tier - 60 call/dakika

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📝 Lisans

MIT License - İstediğiniz gibi kullanın!

## 👤 Geliştirici

Ufuk Olgun

## 🙏 Teşekkürler

- CoinGecko API
- Finnhub API
- Frankfurter API
- Open ExchangeRate API

---

**⭐ Beğendiyseniz yıldız vermeyi unutmayın!**
