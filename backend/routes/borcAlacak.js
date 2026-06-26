const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { tip, durum } = req.query;
  try {
    let query = 'SELECT * FROM borc_alacak WHERE 1=1';
    const params = [];
    if (tip)   { params.push(tip);   query += ` AND tip = $${params.length}`; }
    if (durum) { params.push(durum); query += ` AND durum = $${params.length}`; }
    query += ' ORDER BY olusturma_tarihi DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/ozet', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(tutar) FILTER (WHERE tip='alacak' AND durum != 'emanet'),0) as toplam_alacak,
        COALESCE(SUM(tutar) FILTER (WHERE tip='borc'),0) as toplam_borc,
        COALESCE(SUM(tutar) FILTER (WHERE durum='vadeli'),0) as vadesi_gecen,
        COALESCE(SUM(tutar) FILTER (WHERE durum='emanet'),0) as emanet
      FROM borc_alacak`);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { tip, karsi_taraf, aciklama, tutar, vade_tarihi, durum, kategori } = req.body;
  if (!tip || !karsi_taraf || !tutar)
    return res.status(400).json({ hata: 'Tip, karşı taraf ve tutar zorunlu' });
  try {
    const result = await pool.query(
      `INSERT INTO borc_alacak (tip,karsi_taraf,aciklama,tutar,vade_tarihi,durum,kategori)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tip, karsi_taraf, aciklama, tutar, vade_tarihi||null, durum||'bekliyor', kategori]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  const { tip, karsi_taraf, aciklama, tutar, vade_tarihi, odeme_tarihi, durum, kategori } = req.body;
  try {
    const result = await pool.query(
      `UPDATE borc_alacak SET tip=$1,karsi_taraf=$2,aciklama=$3,tutar=$4,
       vade_tarihi=$5,odeme_tarihi=$6,durum=$7,kategori=$8 WHERE id=$9 RETURNING *`,
      [tip, karsi_taraf, aciklama, tutar, vade_tarihi||null, odeme_tarihi||null, durum, kategori, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM borc_alacak WHERE id=$1', [req.params.id]);
    res.json({ mesaj: 'Kayıt silindi' });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
