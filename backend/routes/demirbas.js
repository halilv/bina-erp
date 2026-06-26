const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { durum } = req.query;
  try {
    let query = 'SELECT * FROM demirbas_listesi WHERE 1=1';
    const params = [];
    if (durum) { params.push(durum); query += ` AND durum = $${params.length}`; }
    query += ' ORDER BY kod';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/ozet', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as toplam,
        COUNT(*) FILTER (WHERE durum='aktif') as aktif,
        COUNT(*) FILTER (WHERE durum='bakimda') as bakimda,
        COUNT(*) FILTER (WHERE durum='hurda') as hurda,
        COALESCE(SUM(guncel_deger),0) as toplam_deger,
        COALESCE(SUM(guncel_deger) FILTER (WHERE durum='aktif'),0) as aktif_deger
      FROM demirbas_listesi`);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/rapor', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT durum, COUNT(*) as adet,
        COALESCE(SUM(guncel_deger),0) as toplam_deger,
        ROUND(100.0*COUNT(*)/(SELECT COUNT(*) FROM demirbas_listesi),1) as oran
      FROM demirbas_listesi GROUP BY durum ORDER BY adet DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { kod, aciklama, konum, marka, model, seri_no, alis_tarihi, alis_fiyati, guncel_deger, durum, notlar } = req.body;
  if (!kod || !aciklama) return res.status(400).json({ hata: 'Kod ve açıklama zorunlu' });
  try {
    const result = await pool.query(
      `INSERT INTO demirbas_listesi (kod,aciklama,konum,marka,model,seri_no,alis_tarihi,alis_fiyati,guncel_deger,durum,notlar)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [kod, aciklama, konum, marka, model, seri_no, alis_tarihi||null, alis_fiyati||null, guncel_deger||null, durum||'aktif', notlar]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code==='23505') return res.status(400).json({ hata: 'Bu kod zaten mevcut' });
    res.status(500).json({ hata: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { aciklama, konum, marka, model, guncel_deger, durum, son_bakim_tarihi, sonraki_bakim_tarihi, notlar } = req.body;
  try {
    const result = await pool.query(
      `UPDATE demirbas_listesi SET aciklama=$1,konum=$2,marka=$3,model=$4,guncel_deger=$5,
       durum=$6,son_bakim_tarihi=$7,sonraki_bakim_tarihi=$8,notlar=$9 WHERE id=$10 RETURNING *`,
      [aciklama, konum, marka, model, guncel_deger, durum, son_bakim_tarihi||null, sonraki_bakim_tarihi||null, notlar, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM demirbas_listesi WHERE id=$1', [req.params.id]);
    res.json({ mesaj: 'Demirbaş silindi' });
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
