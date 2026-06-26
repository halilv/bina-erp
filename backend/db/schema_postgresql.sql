-- Bina ERP - PostgreSQL / Supabase Şeması

-- Kullanıcılar
CREATE TABLE IF NOT EXISTS kullanicilar (
  id SERIAL PRIMARY KEY,
  ad_soyad VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  sifre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'yonetici',
  aktif BOOLEAN DEFAULT true,
  olusturma_tarihi TIMESTAMP DEFAULT NOW()
);

-- Daireler
CREATE TABLE IF NOT EXISTS daireler (
  id SERIAL PRIMARY KEY,
  daire_no VARCHAR(20) UNIQUE NOT NULL,
  blok VARCHAR(50) NOT NULL,
  kat INTEGER NOT NULL,
  tip VARCHAR(20) NOT NULL,
  alan_m2 INTEGER,
  durum VARCHAR(20) DEFAULT 'bos' CHECK (durum IN ('dolu','bos','bakimda')),
  aylik_kira NUMERIC(12,2),
  olusturma_tarihi TIMESTAMP DEFAULT NOW()
);

-- Kiracılar
CREATE TABLE IF NOT EXISTS kiracilar (
  id SERIAL PRIMARY KEY,
  ad_soyad VARCHAR(100) NOT NULL,
  telefon VARCHAR(20),
  email VARCHAR(100),
  tc_kimlik VARCHAR(11),
  daire_id INTEGER REFERENCES daireler(id) ON DELETE SET NULL,
  kira_baslangic DATE,
  kira_bitis DATE,
  depozito NUMERIC(12,2) DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  olusturma_tarihi TIMESTAMP DEFAULT NOW()
);

-- Aidat tahakkukları
CREATE TABLE IF NOT EXISTS aidat_tahakkuklari (
  id SERIAL PRIMARY KEY,
  daire_id INTEGER NOT NULL REFERENCES daireler(id),
  kiraci_id INTEGER REFERENCES kiracilar(id) ON DELETE SET NULL,
  donem VARCHAR(7) NOT NULL,
  tutar NUMERIC(12,2) NOT NULL,
  son_odeme_tarihi DATE,
  odeme_tarihi DATE,
  durum VARCHAR(20) DEFAULT 'bekliyor' CHECK (durum IN ('odendi','bekliyor','gecikti')),
  aciklama TEXT,
  olusturma_tarihi TIMESTAMP DEFAULT NOW()
);

-- Borç / Alacak
CREATE TABLE IF NOT EXISTS borc_alacak (
  id SERIAL PRIMARY KEY,
  tip VARCHAR(10) NOT NULL CHECK (tip IN ('borc','alacak')),
  karsi_taraf VARCHAR(100) NOT NULL,
  aciklama TEXT,
  tutar NUMERIC(12,2) NOT NULL,
  vade_tarihi DATE,
  odeme_tarihi DATE,
  durum VARCHAR(20) DEFAULT 'bekliyor' CHECK (durum IN ('odendi','bekliyor','vadeli','emanet')),
  kategori VARCHAR(50),
  olusturma_tarihi TIMESTAMP DEFAULT NOW()
);

-- Demirbaşlar
CREATE TABLE IF NOT EXISTS demirbas_listesi (
  id SERIAL PRIMARY KEY,
  kod VARCHAR(30) UNIQUE NOT NULL,
  aciklama VARCHAR(200) NOT NULL,
  konum VARCHAR(100),
  marka VARCHAR(100),
  model VARCHAR(100),
  seri_no VARCHAR(100),
  alis_tarihi DATE,
  alis_fiyati NUMERIC(12,2),
  guncel_deger NUMERIC(12,2),
  durum VARCHAR(20) DEFAULT 'aktif' CHECK (durum IN ('aktif','bakimda','hurda','kayip')),
  son_bakim_tarihi DATE,
  sonraki_bakim_tarihi DATE,
  notlar TEXT,
  olusturma_tarihi TIMESTAMP DEFAULT NOW()
);

-- Bakım & Arıza talepleri
CREATE TABLE IF NOT EXISTS bakim_talepleri (
  id SERIAL PRIMARY KEY,
  daire_id INTEGER REFERENCES daireler(id) ON DELETE SET NULL,
  demirbas_id INTEGER REFERENCES demirbas_listesi(id) ON DELETE SET NULL,
  konu VARCHAR(200) NOT NULL,
  aciklama TEXT,
  oncelik VARCHAR(20) DEFAULT 'orta' CHECK (oncelik IN ('acil','orta','dusuk')),
  durum VARCHAR(20) DEFAULT 'acik' CHECK (durum IN ('acik','devam','tamamlandi','iptal')),
  atanan_kisi VARCHAR(100),
  maliyet NUMERIC(12,2),
  acilis_tarihi TIMESTAMP DEFAULT NOW(),
  kapanis_tarihi TIMESTAMP,
  notlar TEXT
);

-- Muhasebe işlemleri
CREATE TABLE IF NOT EXISTS muhasebe_islemleri (
  id SERIAL PRIMARY KEY,
  tip VARCHAR(10) NOT NULL CHECK (tip IN ('gelir','gider')),
  kategori VARCHAR(50) NOT NULL,
  aciklama VARCHAR(200) NOT NULL,
  tutar NUMERIC(12,2) NOT NULL,
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  daire_id INTEGER REFERENCES daireler(id) ON DELETE SET NULL,
  belge_no VARCHAR(50),
  notlar TEXT,
  olusturma_tarihi TIMESTAMP DEFAULT NOW()
);

-- Admin kullanıcı (şifre: admin123)
INSERT INTO kullanicilar (ad_soyad, email, sifre, rol) VALUES
('Sistem Yöneticisi', 'admin@binaerp.com',
 '$2a$10$HHUtYAxgV7mfvHYK/KmXBeSs8.auaQzTshfj/KFHR6WMwDqa4qffG', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Örnek daireler
INSERT INTO daireler (daire_no, blok, kat, tip, alan_m2, durum, aylik_kira) VALUES
('A-101', 'A Blok', 1, '2+1', 85, 'dolu', 18500),
('A-102', 'A Blok', 1, '2+1', 85, 'bos', 18500),
('B-201', 'B Blok', 2, '3+1', 110, 'dolu', 24000),
('B-301', 'B Blok', 3, '3+1', 110, 'bakimda', 24000),
('C-105', 'C Blok', 1, '1+1', 60, 'dolu', 12000),
('D-401', 'D Blok', 4, '4+1', 150, 'dolu', 35000)
ON CONFLICT (daire_no) DO NOTHING;

-- Örnek kiracılar
INSERT INTO kiracilar (ad_soyad, telefon, email, daire_id, kira_baslangic, depozito) VALUES
('Ali Demir', '0532 111 2233', 'ali@mail.com', 1, '2024-01-01', 37000),
('Fatma Kaya', '0533 222 3344', 'fatma@mail.com', 3, '2024-03-01', 48000),
('Mehmet Yildiz', '0534 333 4455', 'mehmet@mail.com', 5, '2024-06-01', 24000),
('Ayse Celik', '0535 444 5566', 'ayse@mail.com', 6, '2023-09-01', 70000);

-- Örnek demirbaşlar
INSERT INTO demirbas_listesi (kod, aciklama, konum, marka, alis_tarihi, alis_fiyati, guncel_deger, durum) VALUES
('D-001', 'Asansor A Blok', 'A Blok', 'Otis', '2019-05-01', 350000, 320000, 'bakimda'),
('D-002', 'Jenerator', 'Bodrum', 'Aksa', '2020-03-15', 95000, 85000, 'aktif'),
('D-003', 'Guvenlik Sistemi', 'Giris', 'Hikvision', '2021-08-01', 48000, 42000, 'aktif'),
('D-004', 'Hidrofor', 'Cati', 'Grundfos', '2018-01-10', 32000, 28000, 'aktif'),
('D-005', 'Bahce Sulama', 'Bahce', 'Rain Bird', '2022-04-20', 18000, 15000, 'aktif');

-- Örnek aidat
INSERT INTO aidat_tahakkuklari (daire_id, kiraci_id, donem, tutar, son_odeme_tarihi, durum) VALUES
(1, 1, '2026-06', 2000, '2026-06-05', 'odendi'),
(3, 2, '2026-06', 2000, '2026-06-05', 'bekliyor'),
(5, 3, '2026-06', 2000, '2026-06-05', 'gecikti'),
(6, 4, '2026-06', 2000, '2026-06-05', 'odendi');

-- Örnek borç/alacak
INSERT INTO borc_alacak (tip, karsi_taraf, aciklama, tutar, vade_tarihi, durum, kategori) VALUES
('alacak', 'Mehmet Yildiz', 'Aidat Haziran', 2000, '2026-06-05', 'vadeli', 'Aidat'),
('alacak', 'Ali Demir', 'Depozito', 37000, NULL, 'emanet', 'Depozito'),
('borc', 'Teknik Servis', 'Asansor bakim', 8200, '2026-06-30', 'bekliyor', 'Bakim'),
('borc', 'Temizlik Ltd', 'Haziran temizlik', 5500, '2026-06-30', 'bekliyor', 'Temizlik');
