const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, d.daire_no, d.blok
      FROM bakim_talepleri b
      LEFT JOIN daireler d ON d.id = b.daire_id
      ORDER BY b.acilis_tarihi DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/ozet', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as toplam,
        COUNT(*) FILTER (WHERE durum='acik') as acik,
        COUNT(*) FILTER (WHERE durum='devam') as devam,
        COUNT(*) FILTER (WHERE durum='tamamlandi') as tamamlandi,
        COUNT(*) FILTER (WHERE oncelik='acil' AND durum != 'tamamlandi') as acil
      FROM bakim_talepleri`);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { daire_id, konu, aciklama, oncelik, atanan_kisi } = req.body;
  if (!konu) return res.status(400).json({ hata: 'Konu zorunlu' });
  try {
    const result = await pool.query(
      `INSERT INTO bakim_talepleri (daire_id, konu, aciklama, oncelik, atanan_kisi)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [daire_id||null, konu, aciklama, oncelik||'orta', atanan_kisi]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  const { konu, aciklama, oncelik, durum, atanan_kisi, maliyet } = req.body;
  try {
    const kapanis = durum === 'tamamlandi' ? 'NOW()' : 'NULL';
    const result = await pool.query(
      `UPDATE bakim_talepleri SET konu=$1, aciklama=$2, oncelik=$3, durum=$4,
       atanan_kisi=$5, maliyet=$6, kapanis_tarihi=${kapanis} WHERE id=$7 RETURNING *`,
      [konu, aciklama, oncelik, durum, atanan_kisi, maliyet||null, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM bakim_talepleri WHERE id=$1', [req.params.id]);
    res.json({ mesaj: 'Talep silindi' });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
