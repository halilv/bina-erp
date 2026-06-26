-- Bina ERP - MySQL Şeması
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS bina_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE bina_erp;

-- Kullanıcılar
CREATE TABLE kullanicilar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad_soyad VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  sifre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'yonetici',
  aktif TINYINT(1) DEFAULT 1,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daireler
CREATE TABLE daireler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  daire_no VARCHAR(20) UNIQUE NOT NULL,
  blok VARCHAR(50) NOT NULL,
  kat INT NOT NULL,
  tip VARCHAR(20) NOT NULL,
  alan_m2 INT,
  durum ENUM('dolu','bos','bakimda') DEFAULT 'bos',
  aylik_kira DECIMAL(12,2),
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kiracılar
CREATE TABLE kiracilar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad_soyad VARCHAR(100) NOT NULL,
  telefon VARCHAR(20),
  email VARCHAR(100),
  tc_kimlik VARCHAR(11),
  daire_id INT,
  kira_baslangic DATE,
  kira_bitis DATE,
  depozito DECIMAL(12,2) DEFAULT 0,
  aktif TINYINT(1) DEFAULT 1,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daire_id) REFERENCES daireler(id) ON DELETE SET NULL
);

-- Aidat tahakkukları
CREATE TABLE aidat_tahakkuklari (
  id INT AUTO_INCREMENT PRIMARY KEY,
  daire_id INT NOT NULL,
  kiraci_id INT,
  donem VARCHAR(7) NOT NULL,
  tutar DECIMAL(12,2) NOT NULL,
  son_odeme_tarihi DATE,
  odeme_tarihi DATE,
  durum ENUM('odendi','bekliyor','gecikti') DEFAULT 'bekliyor',
  aciklama TEXT,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daire_id) REFERENCES daireler(id),
  FOREIGN KEY (kiraci_id) REFERENCES kiracilar(id) ON DELETE SET NULL
);

-- Borç / Alacak
CREATE TABLE borc_alacak (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tip ENUM('borc','alacak') NOT NULL,
  karsi_taraf VARCHAR(100) NOT NULL,
  aciklama TEXT,
  tutar DECIMAL(12,2) NOT NULL,
  vade_tarihi DATE,
  odeme_tarihi DATE,
  durum ENUM('odendi','bekliyor','vadeli','emanet') DEFAULT 'bekliyor',
  kategori VARCHAR(50),
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Demirbaşlar
CREATE TABLE demirbas_listesi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kod VARCHAR(30) UNIQUE NOT NULL,
  aciklama VARCHAR(200) NOT NULL,
  konum VARCHAR(100),
  marka VARCHAR(100),
  model VARCHAR(100),
  seri_no VARCHAR(100),
  alis_tarihi DATE,
  alis_fiyati DECIMAL(12,2),
  guncel_deger DECIMAL(12,2),
  durum ENUM('aktif','bakimda','hurda','kayip') DEFAULT 'aktif',
  son_bakim_tarihi DATE,
  sonraki_bakim_tarihi DATE,
  notlar TEXT,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bakım & Arıza talepleri
CREATE TABLE bakim_talepleri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  daire_id INT,
  demirbas_id INT,
  konu VARCHAR(200) NOT NULL,
  aciklama TEXT,
  oncelik ENUM('acil','orta','dusuk') DEFAULT 'orta',
  durum ENUM('acik','devam','tamamlandi','iptal') DEFAULT 'acik',
  atanan_kisi VARCHAR(100),
  maliyet DECIMAL(12,2),
  acilis_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  kapanis_tarihi DATETIME,
  notlar TEXT,
  FOREIGN KEY (daire_id) REFERENCES daireler(id) ON DELETE SET NULL
);

-- Muhasebe işlemleri
CREATE TABLE muhasebe_islemleri (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tip ENUM('gelir','gider') NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  aciklama VARCHAR(200) NOT NULL,
  tutar DECIMAL(12,2) NOT NULL,
  tarih DATE NOT NULL DEFAULT (CURRENT_DATE),
  daire_id INT,
  belge_no VARCHAR(50),
  notlar TEXT,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daire_id) REFERENCES daireler(id) ON DELETE SET NULL
);

-- ── ÖRNEK VERİLER ──

-- Admin kullanıcı (şifre: admin123)
INSERT INTO kullanicilar (ad_soyad, email, sifre, rol) VALUES
('Sistem Yöneticisi', 'admin@binaerp.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Daireler
INSERT INTO daireler (daire_no, blok, kat, tip, alan_m2, durum, aylik_kira) VALUES
('A-101', 'A Blok', 1, '2+1', 85, 'dolu', 18500),
('A-102', 'A Blok', 1, '2+1', 85, 'bos', 18500),
('B-201', 'B Blok', 2, '3+1', 110, 'dolu', 24000),
('B-301', 'B Blok', 3, '3+1', 110, 'bakimda', 24000),
('C-105', 'C Blok', 1, '1+1', 60, 'dolu', 12000),
('D-401', 'D Blok', 4, '4+1', 150, 'dolu', 35000);

-- Kiracılar
INSERT INTO kiracilar (ad_soyad, telefon, email, daire_id, kira_baslangic, depozito) VALUES
('Ali Demir',    '0532 111 2233', 'ali@mail.com',    1, '2024-01-01', 37000),
('Fatma Kaya',   '0533 222 3344', 'fatma@mail.com',  3, '2024-03-01', 48000),
('Mehmet Yıldız','0534 333 4455', 'mehmet@mail.com', 5, '2024-06-01', 24000),
('Ayşe Çelik',  '0535 444 5566', 'ayse@mail.com',   6, '2023-09-01', 70000);

-- Aidat tahakkukları
INSERT INTO aidat_tahakkuklari (daire_id, kiraci_id, donem, tutar, son_odeme_tarihi, durum) VALUES
(1, 1, '2026-06', 2000, '2026-06-05', 'odendi'),
(3, 2, '2026-06', 2000, '2026-06-05', 'bekliyor'),
(5, 3, '2026-06', 2000, '2026-06-05', 'gecikti'),
(6, 4, '2026-06', 2000, '2026-06-05', 'odendi');

-- Borç/Alacak
INSERT INTO borc_alacak (tip, karsi_taraf, aciklama, tutar, vade_tarihi, durum, kategori) VALUES
('alacak', 'Mehmet Yıldız', 'Aidat Haziran', 2000, '2026-06-05', 'vadeli', 'Aidat'),
('alacak', 'Ali Demir', 'Depozito', 37000, NULL, 'emanet', 'Depozito'),
('borc', 'Teknik Servis A.Ş.', 'Asansör bakım', 8200, '2026-06-30', 'bekliyor', 'Bakım'),
('borc', 'Temizlik Ltd.', 'Haziran temizlik', 5500, '2026-06-30', 'bekliyor', 'Temizlik');

-- Demirbaşlar
INSERT INTO demirbas_listesi (kod, aciklama, konum, marka, alis_tarihi, alis_fiyati, guncel_deger, durum) VALUES
('D-001', 'Asansör (A Blok)', 'A Blok', 'Otis',   '2019-05-01', 350000, 320000, 'bakimda'),
('D-002', 'Jeneratör',        'Bodrum', 'Aksa',    '2020-03-15', 95000,  85000,  'aktif'),
('D-003', 'Güvenlik Sistemi', 'Giriş',  'Hikvision','2021-08-01', 48000,  42000,  'aktif'),
('D-004', 'Hidrofor',         'Çatı',   'Grundfos', '2018-01-10', 32000,  28000,  'aktif'),
('D-005', 'Bahçe Sulama',     'Bahçe',  'Rain Bird','2022-04-20', 18000,  15000,  'aktif');

-- Bakım talepleri
INSERT INTO bakim_talepleri (daire_id, konu, oncelik, durum, atanan_kisi) VALUES
(1, 'Su tesisatı arızası', 'acil', 'devam', 'Ahmet Usta'),
(3, 'Asansör bakımı', 'orta', 'acik', NULL),
(5, 'Elektrik panosu', 'acil', 'devam', 'Elektrik Ustası'),
(6, 'Kapı kilidi değişimi', 'dusuk', 'tamamlandi', 'Çilingir');
