const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, k.ad_soyad as kiraci_adi, k.telefon as kiraci_tel
      FROM daireler d
      LEFT JOIN kiracilar k ON k.daire_id = d.id AND k.aktif = true
      ORDER BY d.blok, d.daire_no`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/ozet', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as toplam,
        COUNT(*) FILTER (WHERE durum='dolu') as dolu,
        COUNT(*) FILTER (WHERE durum='bos') as bos,
        COUNT(*) FILTER (WHERE durum='bakimda') as bakimda,
        COALESCE(SUM(aylik_kira) FILTER (WHERE durum='dolu'),0) as toplam_kira
      FROM daireler`);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, k.ad_soyad as kiraci_adi, k.telefon, k.email, k.depozito, k.kira_baslangic
       FROM daireler d LEFT JOIN kiracilar k ON k.daire_id = d.id AND k.aktif = true
       WHERE d.id = $1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ hata: 'Daire bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { daire_no, blok, kat, tip, alan_m2, durum, aylik_kira } = req.body;
  if (!daire_no || !blok || !kat || !tip)
    return res.status(400).json({ hata: 'Daire no, blok, kat ve tip zorunlu' });
  try {
    const result = await pool.query(
      `INSERT INTO daireler (daire_no,blok,kat,tip,alan_m2,durum,aylik_kira)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [daire_no, blok, kat, tip, alan_m2, durum||'bos', aylik_kira]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code==='23505') return res.status(400).json({ hata: 'Bu daire no zaten mevcut' });
    res.status(500).json({ hata: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { daire_no, blok, kat, tip, alan_m2, durum, aylik_kira } = req.body;
  try {
    const result = await pool.query(
      `UPDATE daireler SET daire_no=$1,blok=$2,kat=$3,tip=$4,alan_m2=$5,durum=$6,aylik_kira=$7
       WHERE id=$8 RETURNING *`,
      [daire_no, blok, kat, tip, alan_m2, durum, aylik_kira, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM daireler WHERE id=$1', [req.params.id]);
    res.json({ mesaj: 'Daire silindi' });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
