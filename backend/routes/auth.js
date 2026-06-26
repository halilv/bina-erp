const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/giris', async (req, res) => {
  const { email, sifre } = req.body;
  if (!email || !sifre) return res.status(400).json({ hata: 'Email ve şifre zorunlu' });
  try {
    const result = await pool.query('SELECT * FROM kullanicilar WHERE email = $1 AND aktif = true', [email]);
    if (!result.rows.length) return res.status(401).json({ hata: 'Email veya şifre hatalı' });
    const kullanici = result.rows[0];
    const eslesme = await bcrypt.compare(sifre, kullanici.sifre);
    if (!eslesme) return res.status(401).json({ hata: 'Email veya şifre hatalı' });
    const token = jwt.sign(
      { id: kullanici.id, email: kullanici.email, rol: kullanici.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ token, kullanici: { id: kullanici.id, ad_soyad: kullanici.ad_soyad, email: kullanici.email, rol: kullanici.rol } });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.post('/kayit', async (req, res) => {
  const { ad_soyad, email, sifre } = req.body;
  if (!ad_soyad || !email || !sifre) return res.status(400).json({ hata: 'Tüm alanlar zorunlu' });
  try {
    const mevcut = await pool.query('SELECT id FROM kullanicilar WHERE email = $1', [email]);
    if (mevcut.rows.length) return res.status(400).json({ hata: 'Bu email zaten kayıtlı' });
    const hash = await bcrypt.hash(sifre, 10);
    const result = await pool.query(
      'INSERT INTO kullanicilar (ad_soyad, email, sifre) VALUES ($1,$2,$3) RETURNING id, ad_soyad, email, rol',
      [ad_soyad, email, hash]
    );
    res.status(201).json({ mesaj: 'Kayıt başarılı', kullanici: result.rows[0] });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
