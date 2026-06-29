// ── HIZLI GİDER FORMU ──
function hizliGiderAc() {
  duzenleId = null;
  document.getElementById('hg-kategori').value = 'Bakim';
  document.getElementById('hg-aciklama').value = '';
  document.getElementById('hg-tutar').value = '';
  document.getElementById('hg-tarih').value = new Date().toISOString().slice(0,10);
  modalAc('modal-hizli-gider');
}

async function hizliGiderKaydet() {
  const veri = {
    tip: 'gider',
    kategori: document.getElementById('hg-kategori').value,
    aciklama: document.getElementById('hg-aciklama').value,
    tutar: parseFloat(document.getElementById('hg-tutar').value),
    tarih: document.getElementById('hg-tarih').value,
  };
  if (!veri.aciklama || !veri.tutar) {
    bildirimGoster('Aciklama ve tutar zorunlu', 'hata');
    return;
  }
  try {
    await API.post('/muhasebe', veri);
    bildirimGoster('Gider kaydedildi', 'basari');
    modalKapat('modal-hizli-gider');
    if (typeof muhasebeYukle === 'function') muhasebeYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

// ── AİDAT ÖDENDİ — ONAY MODALİ ──
let bekleyenAidatId = null;
let bekleyenAidatTutar = null;
let bekleyenAidatDaire = null;

function aidatOdeOnay(id, tutar, daireNo) {
  bekleyenAidatId = id;
  bekleyenAidatTutar = tutar;
  bekleyenAidatDaire = daireNo;
  document.getElementById('aidat-onay-bilgi').textContent =
    `${daireNo} — ${tlFormat(tutar)} tutarında aidat ödemesi`;
  modalAc('modal-aidat-onay');
}

async function aidatOdeOnayla(muhasebeyeYansit) {
  modalKapat('modal-aidat-onay');
  try {
    const sonuc = await API.put(`/aidat/${bekleyenAidatId}/ode`, {
      odeme_tarihi: new Date().toISOString().slice(0,10),
      onay: muhasebeyeYansit
    });
    if (muhasebeyeYansit) {
      bildirimGoster(`Odeme kaydedildi ve muhasebee yansitildi`, 'basari');
    } else {
      bildirimGoster('Odeme kaydedildi', 'basari');
    }
    if (typeof aidatYukle === 'function') aidatYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}
