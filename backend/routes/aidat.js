const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { donem } = req.query;
  try {
    let query = `SELECT a.*, d.daire_no, d.blok, k.ad_soyad as kiraci_adi
      FROM aidat_tahakkuklari a
      JOIN daireler d ON d.id = a.daire_id
      LEFT JOIN kiracilar k ON k.id = a.kiraci_id`;
    const params = [];
    if (donem) { query += ' WHERE a.donem = $1'; params.push(donem); }
    query += ' ORDER BY d.blok, d.daire_no';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/ozet', auth, async (req, res) => {
  const donem = req.query.donem || new Date().toISOString().slice(0,7);
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(tutar),0) as beklenen,
        COALESCE(SUM(tutar) FILTER (WHERE durum='odendi'),0) as tahsil,
        COALESCE(SUM(tutar) FILTER (WHERE durum='bekliyor'),0) as bekliyor,
        COALESCE(SUM(tutar) FILTER (WHERE durum='gecikti'),0) as gecikti,
        COUNT(*) FILTER (WHERE durum='odendi') as odenen_adet,
        COUNT(*) FILTER (WHERE durum IN ('bekliyor','gecikti')) as bekleyen_adet
      FROM aidat_tahakkuklari WHERE donem = $1`, [donem]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { daire_id, kiraci_id, donem, tutar, son_odeme_tarihi } = req.body;
  if (!daire_id || !donem || !tutar)
    return res.status(400).json({ hata: 'Daire, dönem ve tutar zorunlu' });
  try {
    const result = await pool.query(
      `INSERT INTO aidat_tahakkuklari (daire_id,kiraci_id,donem,tutar,son_odeme_tarihi)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [daire_id, kiraci_id||null, donem, tutar, son_odeme_tarihi||null]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.put('/:id/ode', auth, async (req, res) => {
  const { odeme_tarihi } = req.body;
  try {
    const result = await pool.query(
      `UPDATE aidat_tahakkuklari SET durum='odendi', odeme_tarihi=$1 WHERE id=$2 RETURNING *`,
      [odeme_tarihi||new Date().toISOString().slice(0,10), req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM aidat_tahakkuklari WHERE id=$1', [req.params.id]);
    res.json({ mesaj: 'Kayıt silindi' });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/rapor', auth, async (req, res) => {
  const yil = req.query.yil || new Date().getFullYear();
  try {
    const result = await pool.query(`
      SELECT donem,
        SUM(tutar) as beklenen,
        SUM(tutar) FILTER (WHERE durum='odendi') as tahsil,
        SUM(tutar) FILTER (WHERE durum IN ('bekliyor','gecikti')) as bekleyen,
        ROUND(100.0 * COUNT(*) FILTER (WHERE durum='odendi') / NULLIF(COUNT(*),0),1) as tahsilat_orani
      FROM aidat_tahakkuklari WHERE donem LIKE $1
      GROUP BY donem ORDER BY donem`, [yil+'-%']);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
