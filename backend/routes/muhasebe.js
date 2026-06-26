const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { ay } = req.query;
  try {
    let query = `SELECT m.*, d.daire_no FROM muhasebe_islemleri m
      LEFT JOIN daireler d ON d.id = m.daire_id`;
    const params = [];
    if (ay) {
      query += ` WHERE TO_CHAR(m.tarih, 'YYYY-MM') = $1`;
      params.push(ay);
    }
    query += ' ORDER BY m.tarih DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/ozet', auth, async (req, res) => {
  const ay = req.query.ay || new Date().toISOString().slice(0,7);
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(tutar) FILTER (WHERE tip='gelir'), 0) as toplam_gelir,
        COALESCE(SUM(tutar) FILTER (WHERE tip='gider'), 0) as toplam_gider,
        COALESCE(SUM(CASE WHEN tip='gelir' THEN tutar ELSE -tutar END), 0) as net
      FROM muhasebe_islemleri
      WHERE TO_CHAR(tarih, 'YYYY-MM') = $1`, [ay]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/kategoriler', auth, async (req, res) => {
  const ay = req.query.ay || new Date().toISOString().slice(0,7);
  try {
    const result = await pool.query(`
      SELECT kategori, tip, SUM(tutar) as toplam
      FROM muhasebe_islemleri
      WHERE TO_CHAR(tarih, 'YYYY-MM') = $1
      GROUP BY kategori, tip ORDER BY toplam DESC`, [ay]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { tip, kategori, aciklama, tutar, tarih, daire_id, belge_no } = req.body;
  if (!tip || !kategori || !aciklama || !tutar)
    return res.status(400).json({ hata: 'Tip, kategori, açıklama ve tutar zorunlu' });
  try {
    const result = await pool.query(
      `INSERT INTO muhasebe_islemleri (tip, kategori, aciklama, tutar, tarih, daire_id, belge_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tip, kategori, aciklama, tutar, tarih||new Date().toISOString().slice(0,10), daire_id||null, belge_no]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  const { tip, kategori, aciklama, tutar, tarih, daire_id, belge_no } = req.body;
  try {
    const result = await pool.query(
      `UPDATE muhasebe_islemleri SET tip=$1, kategori=$2, aciklama=$3, tutar=$4,
       tarih=$5, daire_id=$6, belge_no=$7 WHERE id=$8 RETURNING *`,
      [tip, kategori, aciklama, tutar, tarih, daire_id||null, belge_no, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM muhasebe_islemleri WHERE id=$1', [req.params.id]);
    res.json({ mesaj: 'İşlem silindi' });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
