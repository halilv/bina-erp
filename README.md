# 🏢 Bina ERP — Bina Yönetim Sistemi

Daire, aidat, borç/alacak, demirbaş ve bakım takibini tek platformda yöneten web tabanlı ERP sistemi.

---

## 🌐 Canlı Erişim

| Servis | URL |
|--------|-----|
| **Frontend** | https://halilv.github.io/bina-erp/giris.html |
| **Backend API** | https://bina-erp-backend.onrender.com |
| **Kaynak Kod** | https://github.com/halilv/bina-erp |

**Demo Giriş:**
- E-posta: `admin@binaerp.com`
- Şifre: `admin123`

---

## 📦 Modüller

| Modül | Özellikler |
|-------|-----------|
| 🏠 **Daire Yönetimi** | Daire listesi, doluluk durumu, kiracı bilgisi, CRUD |
| 🔧 **Bakım & Arıza** | Talep takibi, öncelik ve durum yönetimi |
| 💰 **Muhasebe** | Gelir/gider takibi, kategori bazlı raporlama |
| 📋 **Aidat Takibi** | Dönemsel tahakkuk, ödeme işaretleme, gecikme takibi |
| ↔️ **Borç/Alacak** | Kiracı ve tedarikçi bazlı borç/alacak yönetimi |
| 📦 **Demirbaş** | Envanter takibi, durum ve değer yönetimi |
| 📊 **Raporlar** | PDF ve Excel formatında indirilebilir raporlar |

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | HTML, CSS, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Veritabanı** | PostgreSQL (Supabase) |
| **Auth** | JWT (JSON Web Token) |
| **Raporlama** | PDFKit, ExcelJS |
| **Frontend Hosting** | GitHub Pages |
| **Backend Hosting** | Render.com |

---

## 🚀 Kurulum (Localhost)

### Gereksinimler
- Node.js v18+
- PostgreSQL veya XAMPP (MySQL)

### 1. Repoyu İndir
```bash
git clone https://github.com/halilv/bina-erp.git
cd bina-erp
```

### 2. Veritabanını Kur
PostgreSQL kullanıyorsan:
```bash
psql -U postgres -f backend/db/schema_postgresql.sql
```

### 3. Backend Başlat
```bash
cd backend
npm install
copy .env.example .env
# .env dosyasını düzenle: DATABASE_URL ve JWT_SECRET
npm run dev
```

### 4. Tarayıcıda Aç
```
http://localhost:3001
```

---

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://kullanici:sifre@host:5432/bina_erp
JWT_SECRET=gizli_anahtar
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
```

---

## 📁 Proje Yapısı

```
bina-erp/
├── frontend/
│   ├── index.html          # Ana ERP arayüzü
│   ├── giris.html          # Giriş sayfası
│   ├── css/
│   │   └── style.css       # Stiller
│   └── js/
│       ├── yardimci.js     # API yardımcısı, bildirim, format
│       └── uygulama.js     # Sayfa mantığı, CRUD işlemleri
└── backend/
    ├── server.js           # Express sunucu
    ├── .env.example        # Ortam değişkenleri şablonu
    ├── db/
    │   ├── index.js        # PostgreSQL bağlantısı
    │   └── schema_postgresql.sql  # Veritabanı şeması
    ├── middleware/
    │   └── auth.js         # JWT doğrulama
    └── routes/
        ├── auth.js         # Giriş/kayıt
        ├── daireler.js     # Daire CRUD
        ├── aidat.js        # Aidat takibi
        ├── borcAlacak.js   # Borç/alacak
        ├── demirbas.js     # Demirbaş
        └── raporlar.js     # PDF + Excel raporlar
```

---

## 🔌 API Endpoint'leri

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/api/auth/giris` | Kullanıcı girişi |
| GET | `/api/daireler` | Daire listesi |
| POST | `/api/daireler` | Yeni daire ekle |
| PUT | `/api/daireler/:id` | Daire güncelle |
| DELETE | `/api/daireler/:id` | Daire sil |
| GET | `/api/aidat?donem=2026-06` | Aidat listesi |
| PUT | `/api/aidat/:id/ode` | Ödendi işaretle |
| GET | `/api/borc-alacak` | Borç/alacak listesi |
| GET | `/api/demirbas` | Demirbaş listesi |
| GET | `/api/raporlar/aidat/pdf` | Aidat PDF raporu |
| GET | `/api/raporlar/aidat/excel` | Aidat Excel raporu |
| GET | `/api/raporlar/demirbas/excel` | Demirbaş Excel |
| GET | `/api/raporlar/genel/pdf` | Genel PDF raporu |

> Tüm endpoint'ler JWT token gerektirir: `Authorization: Bearer <token>`

---

## 📅 Geliştirme Süreci

Bu proje **Claude (Anthropic)** yapay zekası ile birlikte geliştirilmiştir.

### Yapılan Çalışmalar
- ✅ 7 modüllü ERP tasarımı ve geliştirmesi
- ✅ Node.js + Express REST API
- ✅ PostgreSQL veritabanı şeması
- ✅ JWT kimlik doğrulama sistemi
- ✅ PDF ve Excel rapor üretimi
- ✅ MySQL → PostgreSQL geçişi
- ✅ Supabase veritabanı kurulumu
- ✅ Render.com'da backend deploy
- ✅ GitHub Pages'de frontend yayını
- ✅ CORS ve production ayarları

---

## 📝 Lisans

MIT License — Serbestçe kullanabilirsiniz.
