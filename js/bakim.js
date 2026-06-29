async function bakimiYukle() {
  try {
    const [ozet, liste] = await Promise.all([
      API.get('/bakim/ozet'),
      API.get('/bakim')
    ]);
    document.getElementById('bakim-metrikler').innerHTML = `
      <div class="metrik vurgu"><div class="etiket">Açık Talepler</div><div class="deger">${ozet.acik}</div></div>
      <div class="metrik"><div class="etiket">Devam Eden</div><div class="deger">${ozet.devam}</div></div>
      <div class="metrik"><div class="etiket">Tamamlanan</div><div class="deger">${ozet.tamamlandi}</div></div>
      <div class="metrik"><div class="etiket">Acil</div><div class="deger">${ozet.acil}</div></div>`;

    if (!liste.length) { document.getElementById('bakim-tablo').innerHTML = bosDurumHTML('Henüz talep yok'); return; }

    document.getElementById('bakim-tablo').innerHTML = `
      <table>
        <thead><tr><th>No</th><th>Daire</th><th>Konu</th><th>Öncelik</th><th>Durum</th><th>Atanan</th><th>Tarih</th><th>İşlem</th></tr></thead>
        <tbody>${liste.map(b => `
          <tr>
            <td>#${b.id}</td>
            <td>${b.daire_no || '—'}</td>
            <td>${b.konu}</td>
            <td>${rozet(b.oncelik==='acil'?'Acil':b.oncelik==='orta'?'Orta':'Düşük', b.oncelik==='acil'?'kirmizi':b.oncelik==='orta'?'sari':'yesil')}</td>
            <td>${rozet(b.durum==='acik'?'Açık':b.durum==='devam'?'Devam':b.durum==='tamamlandi'?'Tamamlandı':'İptal',
                        b.durum==='acik'?'mavi':b.durum==='devam'?'sari':b.durum==='tamamlandi'?'yesil':'kirmizi')}</td>
            <td>${b.atanan_kisi || '—'}</td>
            <td>${tarihFormat(b.acilis_tarihi)}</td>
            <td style="display:flex;gap:4px">
              <button class="btn btn-kucuk" onclick="bakimDuzenleAc(${b.id})">✏️</button>
              <button class="btn btn-kucuk" style="color:var(--renk-kirmizi)" onclick="bakimSilIslem(${b.id})">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function bakimDuzenleAc(id) {
  try {
    const liste = await API.get('/bakim');
    const b = liste.find(x => x.id === id);
    if (!b) return;
    duzenleId = id;
    document.getElementById('bk-daire').value = b.daire_id || '';
    document.getElementById('bk-konu').value = b.konu;
    document.getElementById('bk-aciklama').value = b.aciklama || '';
    document.getElementById('bk-oncelik').value = b.oncelik;
    document.getElementById('bk-atanan').value = b.atanan_kisi || '';
    document.getElementById('bk-durum').value = b.durum;
    document.querySelector('#modal-bakim h3').textContent = 'Talep Düzenle';
    modalAc('modal-bakim');
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}

async function bakimSilIslem(id) {
  silOnay('Bu talebi silmek istiyor musunuz?', async () => {
    try {
      await API.delete('/bakim/' + id);
      bildirimGoster('Talep silindi', 'basari');
      bakimiYukle();
    } catch (e) { bildirimGoster(e.message, 'hata'); }
  });
}

async function bakimKaydet() {
  const veri = {
    daire_id: parseInt(document.getElementById('bk-daire').value) || null,
    konu: document.getElementById('bk-konu').value,
    aciklama: document.getElementById('bk-aciklama').value,
    oncelik: document.getElementById('bk-oncelik').value,
    atanan_kisi: document.getElementById('bk-atanan').value,
    durum: document.getElementById('bk-durum')?.value || 'acik',
  };
  try {
    if (duzenleId) { await API.put('/bakim/' + duzenleId, veri); bildirimGoster('Talep güncellendi', 'basari'); }
    else { await API.post('/bakim', veri); bildirimGoster('Talep eklendi', 'basari'); }
    modalKapat('modal-bakim');
    bakimiYukle();
  } catch (e) { bildirimGoster(e.message, 'hata'); }
}
