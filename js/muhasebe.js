const buAyMuhasebe = new Date().toISOString().slice(0,7);

async function muhasebeYukle() {
  const ay = document.getElementById('muhasebe-ay')?.value || buAyMuhasebe;
  try {
    const [ozet, liste, kategoriler] = await Promise.all([
      API.get('/muhasebe/ozet?ay=' + ay),
      API.get('/muhasebe?ay=' + ay),
      API.get('/muhasebe/kategoriler?ay=' + ay)
    ]);

    document.getElementById('muhasebe-metrikler').innerHTML = `
      <div class="metrik vurgu"><div class="etiket">Toplam Gelir</div><div class="deger">${tlFormat(ozet.toplam_gelir)}</div></div>
      <div class="metrik"><div class="etiket">Toplam Gider</div><div class="deger">${tlFormat(ozet.toplam_gider)}</div></div>
      <div class="metrik"><div class="etiket">Net Gelir</div><div class="deger">${tlFormat(ozet.net)}</div></div>
      <div class="metrik"><div class="etiket">İşlem Sayısı</div><div class="deger">${liste.length}</div></div>`;

    // Kategori bazlı giderler
    const giderler = kategoriler.filter(k => k.tip === 'gider');
    const maxGider = Math.max(...giderler.map(g => Number(g.toplam)), 1);
    document.getElementById('muhasebe-gider').innerHTML = giderler.length ? giderler.map(g => `
      <div class="prog-satir">
        <span style="flex:1;color:var(--renk-yazi)">${g.kategori}</span>
        <div class="prog-bar"><div class="prog-dolgu" style="width:${Math.round(Number(g.toplam)/maxGider*100)}%"></div></div>
        <span class="prog-tutar">${tlFormat(g.toplam)}</span>
      </div>`).join('') : bosDurumHTML('Bu ay gider yok');

    // Son işlemler
    document.getElementById('muhasebe-islemler').innerHTML = liste.length ? `
      <table>
        <thead><tr><th>Açıklama</th><th>Kategori</th><th>Tür</th><th>Tutar</th><th>İşlem</th></tr></thead>
        <tbody>${liste.slice(0,20).map(m => `
          <tr>
            <td>${m.aciklama}</td>
            <td>${m.kategori}</td>
            <td>${rozet(m.tip==='gelir'?'Gelir':'Gider', m.tip==='gelir'?'yesil':'kirmizi')}</td>
            <td>${tlFormat(m.tutar)}</td>
            <td style="display:flex;gap:4px">
              <button class="btn btn-kucuk" onclick="muhasebeDuzenle(${m.id})">✏️</button>
              <button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="muhasebeSil(${m.id})">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>` : bosDurumHTML('Bu ay işlem yok');
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function muhasebeDuzenle(id) {
  try {
    const liste = await API.get('/muhasebe');
    const m = liste.find(x => x.id === id);
    if (!m) return;
    duzenleId = id;
    document.getElementById('mh-tip').value = m.tip;
    document.getElementById('mh-kategori').value = m.kategori;
    document.getElementById('mh-aciklama').value = m.aciklama;
    document.getElementById('mh-tutar').value = m.tutar;
    document.getElementById('mh-tarih').value = m.tarih ? m.tarih.slice(0,10) : '';
    document.getElementById('mh-belge').value = m.belge_no || '';
    document.querySelector('#modal-muhasebe h3').textContent = 'İşlem Düzenle';
    modalAc('modal-muhasebe');
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function muhasebeSil(id) {
  silOnay('Bu işlemi silmek istiyor musunuz?', async () => {
    try {
      await API.delete('/muhasebe/' + id);
      bildirimGoster('İşlem silindi', 'basari');
      muhasebeYukle();
    } catch (e) { bildirimGoster(e.message, 'hata'); }
  });
}

async function muhasebeKaydet() {
  const veri = {
    tip: document.getElementById('mh-tip').value,
    kategori: document.getElementById('mh-kategori').value,
    aciklama: document.getElementById('mh-aciklama').value,
    tutar: parseFloat(document.getElementById('mh-tutar').value),
    tarih: document.getElementById('mh-tarih').value || new Date().toISOString().slice(0,10),
    belge_no: document.getElementById('mh-belge').value || null,
  };
  try {
    if (duzenleId) { await API.put('/muhasebe/' + duzenleId, veri); bildirimGoster('İşlem güncellendi', 'basari'); }
    else { await API.post('/muhasebe', veri); bildirimGoster('İşlem eklendi', 'basari'); }
    modalKapat('modal-muhasebe');
    muhasebeYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}
