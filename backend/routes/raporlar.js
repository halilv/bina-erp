const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const tl = (n) => Number(n||0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL';

router.get('/aidat/pdf', auth, async (req, res) => {
  const donem = req.query.donem || new Date().toISOString().slice(0,7);
  try {
    const { rows } = await pool.query(`
      SELECT a.donem, a.tutar, a.durum, a.son_odeme_tarihi, a.odeme_tarihi,
             d.daire_no, d.blok, k.ad_soyad as kiraci
      FROM aidat_tahakkuklari a
      JOIN daireler d ON d.id = a.daire_id
      LEFT JOIN kiracilar k ON k.id = a.kiraci_id
      WHERE a.donem = $1 ORDER BY d.blok, d.daire_no`, [donem]);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=aidat-raporu-${donem}.pdf`);
    doc.pipe(res);
    doc.fontSize(18).text('Aidat Tahsilat Raporu', { align: 'center' });
    doc.fontSize(12).text(`Donem: ${donem}`, { align: 'center' }).moveDown();
    const toplam = rows.reduce((s,r) => s+Number(r.tutar), 0);
    const tahsil = rows.filter(r=>r.durum==='odendi').reduce((s,r) => s+Number(r.tutar), 0);
    doc.fontSize(11).text(`Toplam: ${tl(toplam)}`).text(`Tahsil: ${tl(tahsil)}`).text(`Bekleyen: ${tl(toplam-tahsil)}`).moveDown();
    const cols = [50,120,180,280,360,450];
    ['Daire','Blok','Kiraci','Tutar','Son Gun','Durum'].forEach((h,i) =>
      doc.fontSize(10).text(h, cols[i], doc.y, { continued: i < 5 }));
    doc.moveDown(0.5);
    doc.moveTo(40,doc.y).lineTo(555,doc.y).stroke().moveDown(0.3);
    rows.forEach(r => {
      const y = doc.y;
      doc.text(r.daire_no,cols[0],y).text(r.blok,cols[1],y).text(r.kiraci||'-',cols[2],y)
         .text(tl(r.tutar),cols[3],y)
         .text(r.son_odeme_tarihi?new Date(r.son_odeme_tarihi).toLocaleDateString('tr-TR'):'-',cols[4],y)
         .text(r.durum,cols[5],y);
      doc.moveDown(0.3);
    });
    doc.end();
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/aidat/excel', auth, async (req, res) => {
  const donem = req.query.donem || new Date().toISOString().slice(0,7);
  try {
    const { rows } = await pool.query(`
      SELECT d.daire_no, d.blok, k.ad_soyad as kiraci, a.tutar, a.son_odeme_tarihi, a.odeme_tarihi, a.durum
      FROM aidat_tahakkuklari a JOIN daireler d ON d.id=a.daire_id
      LEFT JOIN kiracilar k ON k.id=a.kiraci_id
      WHERE a.donem=$1 ORDER BY d.blok, d.daire_no`, [donem]);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`Aidat ${donem}`);
    ws.columns = [
      {header:'Daire No',key:'daire_no',width:12},{header:'Blok',key:'blok',width:12},
      {header:'Kiraci',key:'kiraci',width:25},{header:'Tutar',key:'tutar',width:14},
      {header:'Son Odeme',key:'son_odeme_tarihi',width:14},{header:'Odeme',key:'odeme_tarihi',width:14},
      {header:'Durum',key:'durum',width:12}];
    ws.getRow(1).font = {bold:true};
    rows.forEach(r => ws.addRow(r));
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',`attachment; filename=aidat-${donem}.xlsx`);
    await wb.xlsx.write(res); res.end();
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/demirbas/excel', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM demirbas_listesi ORDER BY kod');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Demirbas');
    ws.columns = [
      {header:'Kod',key:'kod',width:12},{header:'Aciklama',key:'aciklama',width:28},
      {header:'Konum',key:'konum',width:18},{header:'Marka',key:'marka',width:14},
      {header:'Alis Tarihi',key:'alis_tarihi',width:14},{header:'Guncel Deger',key:'guncel_deger',width:14},
      {header:'Durum',key:'durum',width:12}];
    ws.getRow(1).font = {bold:true};
    rows.forEach(r => ws.addRow(r));
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename=demirbas.xlsx');
    await wb.xlsx.write(res); res.end();
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/borc-alacak/excel', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM borc_alacak ORDER BY olusturma_tarihi DESC');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Borc Alacak');
    ws.columns = [
      {header:'Tip',key:'tip',width:10},{header:'Karsi Taraf',key:'karsi_taraf',width:25},
      {header:'Aciklama',key:'aciklama',width:30},{header:'Tutar',key:'tutar',width:14},
      {header:'Vade',key:'vade_tarihi',width:14},{header:'Durum',key:'durum',width:12},
      {header:'Kategori',key:'kategori',width:16}];
    ws.getRow(1).font = {bold:true};
    rows.forEach(r => ws.addRow(r));
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename=borc-alacak.xlsx');
    await wb.xlsx.write(res); res.end();
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

router.get('/genel/pdf', auth, async (req, res) => {
  try {
    const donem = new Date().toISOString().slice(0,7);
    const [d,a,b,dm] = await Promise.all([
      pool.query(`SELECT COUNT(*) as toplam, COUNT(*) FILTER (WHERE durum='dolu') as dolu, COALESCE(SUM(aylik_kira) FILTER (WHERE durum='dolu'),0) as kira FROM daireler`),
      pool.query(`SELECT COALESCE(SUM(tutar),0) as beklenen, COALESCE(SUM(tutar) FILTER (WHERE durum='odendi'),0) as tahsil FROM aidat_tahakkuklari WHERE donem=$1`,[donem]),
      pool.query(`SELECT COALESCE(SUM(tutar) FILTER (WHERE tip='alacak'),0) as alacak, COALESCE(SUM(tutar) FILTER (WHERE tip='borc'),0) as borc FROM borc_alacak WHERE durum != 'emanet'`),
      pool.query(`SELECT COUNT(*) as toplam, COALESCE(SUM(guncel_deger),0) as deger FROM demirbas_listesi WHERE durum='aktif'`),
    ]);
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename=genel-rapor.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Bina ERP - Genel Rapor', { align: 'center' });
    doc.fontSize(11).text(new Date().toLocaleDateString('tr-TR'), { align: 'center' }).moveDown();
    const sec = (t) => { doc.moveDown(0.5); doc.fontSize(14).text(t); doc.moveTo(40,doc.y).lineTo(555,doc.y).stroke(); doc.moveDown(0.3); doc.fontSize(11); };
    sec('Daire Durumu');
    doc.text(`Toplam: ${d.rows[0].toplam}  Dolu: ${d.rows[0].dolu}  Kira: ${tl(d.rows[0].kira)}`);
    sec('Aidat (Bu Ay)');
    doc.text(`Beklenen: ${tl(a.rows[0].beklenen)}  Tahsil: ${tl(a.rows[0].tahsil)}`);
    sec('Borc / Alacak');
    doc.text(`Alacak: ${tl(b.rows[0].alacak)}  Borc: ${tl(b.rows[0].borc)}`);
    sec('Demirbas');
    doc.text(`Aktif: ${dm.rows[0].toplam} adet  Deger: ${tl(dm.rows[0].deger)}`);
    doc.end();
  } catch (err) { res.status(500).json({ hata: err.message }); }
});

module.exports = router;
