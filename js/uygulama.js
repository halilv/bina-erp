// ── KULLANICI BİLGİSİ ──
const kullanici = JSON.parse(localStorage.getItem('kullanici') || '{}');
if (kullanici.ad_soyad) {
  document.getElementById('kullanici-ad').textContent = kullanici.ad_soyad;
  document.getElementById('kullanici-rol').textContent = kullanici.rol || 'Yönetici';
  document.getElementById('avatar-harf').textContent = kullanici.ad_soyad.charAt(0).toUpperCase();
}

// ── SAYFA YÖNETİMİ ──
const sayfaAyarlari = {
  daire:    { baslik: 'Daire / Kat Yönetimi',  etiket: 'Yeni Daire',    modal: 'modal-daire',    yukle: daireyiYukle },
  bakim:    { baslik: 'Bakım & Arıza Takibi',  etiket: 'Yeni Talep',    modal: 'modal-bakim',    yukle: bakimiYukle },
  muhasebe: { baslik: 'Muhasebe',              etiket: null,            modal: null,             yukle: muhasebeYukle },
  aidat:    { baslik: 'Aidat Takibi',          etiket: 'Yeni Aidat',    modal: 'modal-aidat',    yukle: aidatYukle },
  borc:     { baslik: 'Borç / Alacak Takibi', etiket: 'Yeni Kayıt',   modal: 'modal-borc',     yukle: borcYukle },
  demirbas: { baslik: 'Demirbaş Takibi',       etiket: 'Yeni Demirbaş',modal: 'modal-demirbas', yukle: demirbasYukle },
  rapor:    { baslik: 'Raporlar',              etiket: null,            modal: null,             yukle: raporYukle },
};

let mevcutSayfa = 'daire';
let duzenleId = null;

function sayfaGit(ad, el) {
  document.querySelectorAll('.sayfa').forEach(s => s.classList.remove('aktif'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('aktif'));
  document.getElementById('sayfa-' + ad)?.classList.add('aktif');
  el?.classList.add('aktif');
  const ayar = sayfaAyarlari[ad];
  document.getElementById('sayfa-baslik').textContent = ayar.baslik;
  const ekleBtn = document.getElementById('ekle-btn');
  if (ayar.etiket && ayar.modal) {
    ekleBtn.style.display = '';
    document.getElementById('ekle-etiket').textContent = ayar.etiket;
  } else {
    ekleBtn.style.display = 'none';
  }
  mevcutSayfa = ad;
  ayar.yukle();
}

function yeniEkleAc() {
  duzenleId = null;
  const modal = sayfaAyarlari[mevcutSayfa]?.modal;
  if (modal) {
    // Formu temizle
    document.querySelectorAll(`#${modal} input, #${modal} select, #${modal} textarea`).forEach(el => el.value = '');
    document.querySelector(`#${modal} h3`).textContent = sayfaAyarlari[mevcutSayfa].etiket;
    modalAc(modal);
  }
}

function cikisYap() {
  localStorage.removeItem('token');
  localStorage.removeItem('kullanici');
  window.location.href = '/giris.html';
}

// ── SİL ONAY ──
function silOnay(mesaj, callback) {
  if (confirm(mesaj)) callback();
}

// ── DAİRE ──
async function daireyiYukle() {
  try {
    const [ozet, liste] = await Promise.all([API.get('/daireler/ozet'), API.get('/daireler')]);
    document.getElementById('daire-metrikler').innerHTML = `
      <div class="metrik vurgu"><div class="etiket">Toplam Daire</div><div class="deger">${ozet.toplam}</div></div>
      <div class="metrik"><div class="etiket">Dolu</div><div class="deger">${ozet.dolu}</div><div class="alt">%${Math.round(ozet.dolu/ozet.toplam*100)} doluluk</div></div>
      <div class="metrik"><div class="etiket">Boş</div><div class="deger">${ozet.bos}</div></div>
      <div class="metrik"><div class="etiket">Aylık Kira</div><div class="deger">${tlFormat(ozet.toplam_kira)}</div></div>`;
    if (!liste.length) { document.getElementById('daire-tablo').innerHTML = bosDurumHTML(); return; }
    document.getElementById('daire-tablo').innerHTML = `
      <table>
        <thead><tr><th>Daire</th><th>Blok</th><th>Kat</th><th>Tip</th><th>Kiracı</th><th>Kira</th><th>Durum</th><th>İşlem</th></tr></thead>
        <tbody>${liste.map(d => `
          <tr>
            <td><strong>${d.daire_no}</strong></td>
            <td>${d.blok}</td><td>${d.kat}</td><td>${d.tip}</td>
            <td>${d.kiraci_adi || '—'}</td>
            <td>${d.aylik_kira ? tlFormat(d.aylik_kira) : '—'}</td>
            <td>${rozet(d.durum==='bos'?'Boş':d.durum==='dolu'?'Dolu':'Bakımda', d.durum==='bos'?'sari':d.durum==='dolu'?'yesil':'kirmizi')}</td>
            <td>
              <button class="btn btn-kucuk" onclick="daireDuzenle(${d.id})">✏️</button>
              <button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="daireSil(${d.id})">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function daireDuzenle(id) {
  try {
    const d = await API.get('/daireler/' + id);
    duzenleId = id;
    document.getElementById('d-no').value = d.daire_no;
    document.getElementById('d-blok').value = d.blok;
    document.getElementById('d-kat').value = d.kat;
    document.getElementById('d-tip').value = d.tip;
    document.getElementById('d-alan').value = d.alan_m2 || '';
    document.getElementById('d-durum').value = d.durum;
    document.getElementById('d-kira').value = d.aylik_kira || '';
    document.querySelector('#modal-daire h3').textContent = 'Daire Düzenle';
    modalAc('modal-daire');
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function daireSil(id) {
  silOnay('Bu daireyi silmek istediğinizden emin misiniz?', async () => {
    try {
      await API.delete('/daireler/' + id);
      bildirimGoster('Daire silindi', 'basari');
      daireyiYukle();
    } catch (e) { bildirimGoster(e.message, 'hata'); }
  });
}

async function daireKaydet() {
  const veri = {
    daire_no: document.getElementById('d-no').value,
    blok: document.getElementById('d-blok').value,
    kat: parseInt(document.getElementById('d-kat').value),
    tip: document.getElementById('d-tip').value,
    alan_m2: parseInt(document.getElementById('d-alan').value) || null,
    durum: document.getElementById('d-durum').value,
    aylik_kira: parseFloat(document.getElementById('d-kira').value) || null,
  };
  try {
    if (duzenleId) { await API.put('/daireler/' + duzenleId, veri); bildirimGoster('Daire güncellendi', 'basari'); }
    else { await API.post('/daireler', veri); bildirimGoster('Daire eklendi', 'basari'); }
    modalKapat('modal-daire');
    daireyiYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

// ── BAKIM ──
async function bakimiYukle() {
  document.getElementById('bakim-metrikler').innerHTML = `
    <div class="metrik vurgu"><div class="etiket">Açık Talepler</div><div class="deger">12</div></div>
    <div class="metrik"><div class="etiket">Devam Eden</div><div class="deger">5</div></div>
    <div class="metrik"><div class="etiket">Tamamlanan</div><div class="deger">38</div><div class="alt">Bu ay</div></div>
    <div class="metrik"><div class="etiket">Acil</div><div class="deger">2</div></div>`;
  document.getElementById('bakim-tablo').innerHTML = `
    <table>
      <thead><tr><th>No</th><th>Daire</th><th>Konu</th><th>Öncelik</th><th>Durum</th><th>Tarih</th><th>İşlem</th></tr></thead>
      <tbody>
        <tr><td>#1042</td><td>A-101</td><td>Su tesisatı</td><td>${rozet('Acil','kirmizi')}</td><td>${rozet('Devam','sari')}</td><td>23 Haz</td><td><button class="btn btn-kucuk" onclick="bakimDuzenle()">✏️</button><button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="bakimSil()">🗑️</button></td></tr>
        <tr><td>#1041</td><td>B-201</td><td>Asansör bakımı</td><td>${rozet('Orta','sari')}</td><td>${rozet('Planlandı','mavi')}</td><td>22 Haz</td><td><button class="btn btn-kucuk" onclick="bakimDuzenle()">✏️</button><button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="bakimSil()">🗑️</button></td></tr>
        <tr><td>#1040</td><td>C-105</td><td>Elektrik panosu</td><td>${rozet('Acil','kirmizi')}</td><td>${rozet('Devam','sari')}</td><td>21 Haz</td><td><button class="btn btn-kucuk" onclick="bakimDuzenle()">✏️</button><button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="bakimSil()">🗑️</button></td></tr>
      </tbody>
    </table>`;
}
function bakimDuzenle() { bildirimGoster('Düzenleme açıldı', 'basari'); }
function bakimSil() { silOnay('Bu talebi silmek istiyor musunuz?', () => bildirimGoster('Talep silindi', 'basari')); }
async function bakimKaydet() { bildirimGoster('Talep kaydedildi', 'basari'); modalKapat('modal-bakim'); }

// ── MUHASEBE ──
async function muhasebeYukle() {
  document.getElementById('muhasebe-metrikler').innerHTML = `
    <div class="metrik vurgu"><div class="etiket">Kira Geliri</div><div class="deger">₺612K</div><div class="alt">Haziran</div></div>
    <div class="metrik"><div class="etiket">Toplam Gider</div><div class="deger">₺148K</div></div>
    <div class="metrik"><div class="etiket">Net Gelir</div><div class="deger">₺464K</div></div>
    <div class="metrik"><div class="etiket">Gecikmiş</div><div class="deger">₺36K</div></div>`;
  document.getElementById('muhasebe-gider').innerHTML = `
    <div class="prog-satir"><span style="flex:1">Personel</span><div class="prog-bar"><div class="prog-dolgu" style="width:68%"></div></div><span class="prog-tutar">₺54K</span></div>
    <div class="prog-satir"><span style="flex:1">Bakım</span><div class="prog-bar"><div class="prog-dolgu" style="width:42%"></div></div><span class="prog-tutar">₺38K</span></div>
    <div class="prog-satir"><span style="flex:1">Elektrik/Su</span><div class="prog-bar"><div class="prog-dolgu" style="width:28%"></div></div><span class="prog-tutar">₺22K</span></div>
    <div class="prog-satir"><span style="flex:1">Sigorta</span><div class="prog-bar"><div class="prog-dolgu" style="width:18%"></div></div><span class="prog-tutar">₺18K</span></div>`;
  document.getElementById('muhasebe-islemler').innerHTML = `
    <table>
      <thead><tr><th>Açıklama</th><th>Tür</th><th>Tutar</th></tr></thead>
      <tbody>
        <tr><td>A-101 Kira</td><td>${rozet('Gelir','yesil')}</td><td>₺18.500</td></tr>
        <tr><td>Asansör bakım</td><td>${rozet('Gider','kirmizi')}</td><td>₺8.200</td></tr>
        <tr><td>B-201 Kira</td><td>${rozet('Gelir','yesil')}</td><td>₺24.000</td></tr>
        <tr><td>Elektrik</td><td>${rozet('Gider','kirmizi')}</td><td>₺5.400</td></tr>
      </tbody>
    </table>`;
}

// ── AİDAT ──
const buAy = new Date().toISOString().slice(0,7);
document.getElementById('aidat-donem').value = buAy;

async function aidatYukle() {
  const donem = document.getElementById('aidat-donem').value || buAy;
  try {
    const [ozet, liste] = await Promise.all([API.get(`/aidat/ozet?donem=${donem}`), API.get(`/aidat?donem=${donem}`)]);
    document.getElementById('aidat-metrikler').innerHTML = `
      <div class="metrik vurgu"><div class="etiket">Beklenen</div><div class="deger">${tlFormat(ozet.beklenen)}</div></div>
      <div class="metrik"><div class="etiket">Tahsil</div><div class="deger">${tlFormat(ozet.tahsil)}</div></div>
      <div class="metrik"><div class="etiket">Bekleyen</div><div class="deger">${tlFormat(ozet.bekliyor)}</div><div class="alt">${ozet.bekleyen_adet} daire</div></div>
      <div class="metrik"><div class="etiket">Gecikmiş</div><div class="deger">${tlFormat(ozet.gecikti)}</div></div>`;
    if (!liste.length) { document.getElementById('aidat-tablo').innerHTML = bosDurumHTML('Bu dönem için kayıt yok'); return; }
    document.getElementById('aidat-tablo').innerHTML = `
      <table>
        <thead><tr><th>Daire</th><th>Blok</th><th>Kiracı</th><th>Tutar</th><th>Son Gün</th><th>Ödeme</th><th>Durum</th><th>İşlem</th></tr></thead>
        <tbody>${liste.map(a => `
          <tr>
            <td><strong>${a.daire_no}</strong></td><td>${a.blok}</td>
            <td>${a.kiraci_adi || '—'}</td>
            <td>${tlFormat(a.tutar)}</td>
            <td>${tarihFormat(a.son_odeme_tarihi)}</td>
            <td>${tarihFormat(a.odeme_tarihi)}</td>
            <td>${rozet(a.durum==='odendi'?'Ödendi':a.durum==='gecikti'?'Gecikti':'Bekliyor', a.durum==='odendi'?'yesil':a.durum==='gecikti'?'kirmizi':'sari')}</td>
            <td style="display:flex;gap:4px">
              ${a.durum !== 'odendi' ? `<button class="btn btn-kucuk btn-birincil" onclick="aidatOde(${a.id})">✓ Ödendi</button>` : ''}
              <button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="aidatSil(${a.id})">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function aidatOde(id) {
  try {
    await API.put(`/aidat/${id}/ode`, { odeme_tarihi: new Date().toISOString().slice(0,10) });
    bildirimGoster('Ödeme kaydedildi', 'basari');
    aidatYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function aidatSil(id) {
  silOnay('Bu aidat kaydını silmek istiyor musunuz?', async () => {
    try {
      await API.delete('/aidat/' + id);
      bildirimGoster('Kayıt silindi', 'basari');
      aidatYukle();
    } catch (e) { bildirimGoster(e.message, 'hata'); }
  });
}

async function aidatKaydet() {
  try {
    await API.post('/aidat', {
      daire_id: parseInt(document.getElementById('a-daire').value),
      kiraci_id: parseInt(document.getElementById('a-kiraci').value) || null,
      donem: document.getElementById('a-donem').value,
      tutar: parseFloat(document.getElementById('a-tutar').value),
      son_odeme_tarihi: document.getElementById('a-son').value || null,
    });
    modalKapat('modal-aidat');
    bildirimGoster('Aidat eklendi', 'basari');
    aidatYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

// ── BORÇ/ALACAK ──
async function borcYukle() {
  try {
    const [ozet, liste] = await Promise.all([API.get('/borc-alacak/ozet'), API.get('/borc-alacak')]);
    document.getElementById('borc-metrikler').innerHTML = `
      <div class="metrik vurgu"><div class="etiket">Toplam Alacak</div><div class="deger">${tlFormat(ozet.toplam_alacak)}</div></div>
      <div class="metrik"><div class="etiket">Toplam Borç</div><div class="deger">${tlFormat(ozet.toplam_borc)}</div></div>
      <div class="metrik"><div class="etiket">Net Pozisyon</div><div class="deger">+${tlFormat(Number(ozet.toplam_alacak||0)-Number(ozet.toplam_borc||0))}</div></div>
      <div class="metrik"><div class="etiket">Vadesi Geçen</div><div class="deger">${tlFormat(ozet.vadesi_gecen)}</div></div>`;
    const alacaklar = liste.filter(r => r.tip === 'alacak');
    const borclar   = liste.filter(r => r.tip === 'borc');
    const tabloHTML = (rows) => rows.length ? `
      <table>
        <thead><tr><th>Karşı Taraf</th><th>Açıklama</th><th>Tutar</th><th>Durum</th><th>İşlem</th></tr></thead>
        <tbody>${rows.map(r => `
          <tr>
            <td>${r.karsi_taraf}</td><td>${r.aciklama||'—'}</td>
            <td>${tlFormat(r.tutar)}</td><td>${rozet(r.durum)}</td>
            <td>
              <button class="btn btn-kucuk" onclick="borcDuzenle(${r.id})">✏️</button>
              <button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="borcSil(${r.id})">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>` : bosDurumHTML();
    document.getElementById('alacak-tablo').innerHTML = tabloHTML(alacaklar);
    document.getElementById('borc-tablo').innerHTML   = tabloHTML(borclar);
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function borcDuzenle(id) {
  try {
    const liste = await API.get('/borc-alacak');
    const r = liste.find(x => x.id === id);
    if (!r) return;
    duzenleId = id;
    document.getElementById('ba-tip').value = r.tip;
    document.getElementById('ba-taraf').value = r.karsi_taraf;
    document.getElementById('ba-aciklama').value = r.aciklama || '';
    document.getElementById('ba-tutar').value = r.tutar;
    document.getElementById('ba-vade').value = r.vade_tarihi ? r.vade_tarihi.slice(0,10) : '';
    document.getElementById('ba-durum').value = r.durum;
    document.getElementById('ba-kategori').value = r.kategori || '';
    document.querySelector('#modal-borc h3').textContent = 'Kayıt Düzenle';
    modalAc('modal-borc');
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function borcSil(id) {
  silOnay('Bu kaydı silmek istiyor musunuz?', async () => {
    try {
      await API.delete('/borc-alacak/' + id);
      bildirimGoster('Kayıt silindi', 'basari');
      borcYukle();
    } catch (e) { bildirimGoster(e.message, 'hata'); }
  });
}

async function borcKaydet() {
  const veri = {
    tip: document.getElementById('ba-tip').value,
    karsi_taraf: document.getElementById('ba-taraf').value,
    aciklama: document.getElementById('ba-aciklama').value,
    tutar: parseFloat(document.getElementById('ba-tutar').value),
    vade_tarihi: document.getElementById('ba-vade').value || null,
    durum: document.getElementById('ba-durum').value,
    kategori: document.getElementById('ba-kategori').value,
  };
  try {
    if (duzenleId) { await API.put('/borc-alacak/' + duzenleId, veri); bildirimGoster('Kayıt güncellendi', 'basari'); }
    else { await API.post('/borc-alacak', veri); bildirimGoster('Kayıt eklendi', 'basari'); }
    modalKapat('modal-borc');
    borcYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

// ── DEMİRBAŞ ──
async function demirbasYukle() {
  try {
    const [ozet, liste] = await Promise.all([API.get('/demirbas/ozet'), API.get('/demirbas')]);
    document.getElementById('demirbas-metrikler').innerHTML = `
      <div class="metrik vurgu"><div class="etiket">Toplam</div><div class="deger">${ozet.toplam}</div></div>
      <div class="metrik"><div class="etiket">Aktif</div><div class="deger">${ozet.aktif}</div><div class="alt">%${Math.round(ozet.aktif/ozet.toplam*100)}</div></div>
      <div class="metrik"><div class="etiket">Bakımda</div><div class="deger">${ozet.bakimda}</div></div>
      <div class="metrik"><div class="etiket">Toplam Değer</div><div class="deger">${tlFormat(ozet.aktif_deger)}</div></div>`;
    if (!liste.length) { document.getElementById('demirbas-tablo').innerHTML = bosDurumHTML(); return; }
    document.getElementById('demirbas-tablo').innerHTML = `
      <table>
        <thead><tr><th>Kod</th><th>Açıklama</th><th>Konum</th><th>Marka</th><th>Alış Tarihi</th><th>Değer</th><th>Durum</th><th>İşlem</th></tr></thead>
        <tbody>${liste.map(d => `
          <tr>
            <td><strong>${d.kod}</strong></td><td>${d.aciklama}</td>
            <td>${d.konum||'—'}</td><td>${d.marka||'—'}</td>
            <td>${tarihFormat(d.alis_tarihi)}</td>
            <td>${d.guncel_deger ? tlFormat(d.guncel_deger) : '—'}</td>
            <td>${rozet(d.durum==='aktif'?'Aktif':d.durum==='bakimda'?'Bakımda':'Hurda', d.durum==='aktif'?'yesil':d.durum==='bakimda'?'sari':'kirmizi')}</td>
            <td>
              <button class="btn btn-kucuk" onclick="demirbasDuzenle(${d.id})">✏️</button>
              <button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="demirbasSil(${d.id})">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function demirbasDuzenle(id) {
  try {
    const liste = await API.get('/demirbas');
    const d = liste.find(x => x.id === id);
    if (!d) return;
    duzenleId = id;
    document.getElementById('dm-kod').value = d.kod;
    document.getElementById('dm-aciklama').value = d.aciklama;
    document.getElementById('dm-konum').value = d.konum || '';
    document.getElementById('dm-marka').value = d.marka || '';
    document.getElementById('dm-tarih').value = d.alis_tarihi ? d.alis_tarihi.slice(0,10) : '';
    document.getElementById('dm-deger').value = d.guncel_deger || '';
    document.getElementById('dm-durum').value = d.durum;
    document.querySelector('#modal-demirbas h3').textContent = 'Demirbaş Düzenle';
    modalAc('modal-demirbas');
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function demirbasSil(id) {
  silOnay('Bu demirbaşı silmek istiyor musunuz?', async () => {
    try {
      await API.delete('/demirbas/' + id);
      bildirimGoster('Demirbaş silindi', 'basari');
      demirbasYukle();
    } catch (e) { bildirimGoster(e.message, 'hata'); }
  });
}

async function demirbasKaydet() {
  const veri = {
    kod: document.getElementById('dm-kod').value,
    aciklama: document.getElementById('dm-aciklama').value,
    konum: document.getElementById('dm-konum').value,
    marka: document.getElementById('dm-marka').value,
    alis_tarihi: document.getElementById('dm-tarih').value || null,
    guncel_deger: parseFloat(document.getElementById('dm-deger').value) || null,
    durum: document.getElementById('dm-durum').value,
  };
  try {
    if (duzenleId) { await API.put('/demirbas/' + duzenleId, veri); bildirimGoster('Demirbaş güncellendi', 'basari'); }
    else { await API.post('/demirbas', veri); bildirimGoster('Demirbaş eklendi', 'basari'); }
    modalKapat('modal-demirbas');
    demirbasYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

// ── RAPORLAR ──
function raporYukle() {
  const donem = new Date().toISOString().slice(0,7);
  document.getElementById('rapor-icerik').innerHTML = `
    <div class="rapor-kart">
      <h3>📋 Aidat Tahsilat Raporu</h3>
      <p>Dönemsel aidat ödemeleri ve tahsilat oranları</p>
      <div class="rapor-butonlar">
        <button class="btn btn-birincil" onclick="window.open(API_URL + '/api/raporlar/aidat/pdf?donem=' + donem)">PDF İndir</button>
        <button class="btn" onclick="window.open(API_URL + '/api/raporlar/aidat/excel?donem=' + donem)">Excel İndir</button>
      </div>
    </div>
    <div class="rapor-kart">
      <h3>💰 Borç / Alacak Raporu</h3>
      <p>Tüm borç ve alacak kayıtları</p>
      <div class="rapor-butonlar">
        <button class="btn btn-birincil" onclick="window.open(API_URL + '/api/raporlar/borc-alacak/excel')">Excel İndir</button>
      </div>
    </div>
    <div class="rapor-kart">
      <h3>📦 Demirbaş Envanter Raporu</h3>
      <p>Tüm demirbaşlar ve değer dökümü</p>
      <div class="rapor-butonlar">
        <button class="btn btn-birincil" onclick="window.open(API_URL + '/api/raporlar/demirbas/excel')">Excel İndir</button>
      </div>
    </div>
    <div class="rapor-kart">
      <h3>📊 Genel Yönetim Raporu</h3>
      <p>Tüm modüllerin özet raporu</p>
      <div class="rapor-butonlar">
        <button class="btn btn-birincil" onclick="window.open(API_URL + '/api/raporlar/genel/pdf')">PDF İndir</button>
      </div>
    </div>`;
}

// ── AİDAT SİL ROUTE EKLE ──
// Not: backend'e DELETE /aidat/:id rotası eklendi

// ── İLK YÜKLEME ──
daireyiYukle();
