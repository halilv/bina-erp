# 🏢 Bina ERP — Kurulum Kılavuzu (MySQL)

## Gereksinimler
- Node.js v18+
- MySQL 8.0+ (XAMPP, WAMP veya doğrudan MySQL)

---

## 1. MySQL / XAMPP Kur

👉 En kolay yol: **XAMPP** indir → https://www.apachefriends.org
- XAMPP'ı kur ve **MySQL** servisini başlat
- **phpMyAdmin** otomatik gelir: http://localhost/phpmyadmin

---

## 2. Veritabanını Oluştur

phpMyAdmin'i aç → sol üstteki **Yeni** butonuna tıkla:
- Veritabanı adı: `bina_erp`
- Karakter seti: `utf8mb4_turkish_ci`
- **Oluştur** butonuna bas

Sonra **SQL** sekmesine tıkla → `backend/db/schema.sql` dosyasının içeriğini yapıştır → **Git** butonuna bas.

---

## 3. Backend Kur

```bash
cd backend
npm install
copy .env.example .env
```

`.env` dosyasını not defteri ile aç ve düzenle:
```
DB_PASSWORD=        (XAMPP'ta boş bırak, MySQL şifren varsa yaz)
JWT_SECRET=binaerp_super_gizli_anahtar_2026
```

---

## 4. Sunucuyu Başlat

```bash
npm run dev
```

Tarayıcıda aç: **http://localhost:3001**

**Demo Giriş:**
- E-posta: `admin@binaerp.com`
- Şifre: `admin123`

---

## Proje Yapısı

```
bina-erp/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── db/
│   │   ├── index.js       # MySQL bağlantısı
│   │   └── schema.sql     # MySQL şeması + örnek veriler
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js
│       ├── daireler.js
│       ├── aidat.js
│       ├── borcAlacak.js
│       ├── demirbas.js
│       └── raporlar.js    # PDF + Excel
└── frontend/
    ├── index.html
    ├── giris.html
    ├── css/style.css
    └── js/
        ├── yardimci.js
        └── uygulama.js
```
