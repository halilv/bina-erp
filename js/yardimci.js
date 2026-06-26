// ── API YARDIMCISI ──
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' // localhost'ta relative URL kullan
  : 'https://bina-erp-backend.onrender.com'; // production

const API = {
  async istek(yol, secenekler = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(API_URL + '/api' + yol, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...secenekler,
    });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('kullanici');
      window.location.href = '/giris.html';
      return;
    }
    const veri = await res.json();
    if (!res.ok) throw new Error(veri.hata || 'Bir hata oluştu');
    return veri;
  },
  get(yol) { return this.istek(yol); },
  post(yol, veri) { return this.istek(yol, { method: 'POST', body: JSON.stringify(veri) }); },
  put(yol, veri) { return this.istek(yol, { method: 'PUT', body: JSON.stringify(veri) }); },
  delete(yol) { return this.istek(yol, { method: 'DELETE' }); },
};

// ── AUTH KONTROLÜ ──
function authKontrol() {
  const token = localStorage.getItem('token');
  const girisGereken = !window.location.pathname.includes('giris');
  if (!token && girisGereken) {
    window.location.href = 'giris.html';
  }
}

// ── BİLDİRİM ──
function bildirimGoster(mesaj, tip = 'basari') {
  let el = document.getElementById('bildirim');
  if (!el) {
    el = document.createElement('div');
    el.id = 'bildirim';
    el.className = 'bildirim';
    document.body.appendChild(el);
  }
  el.textContent = mesaj;
  el.className = `bildirim ${tip} goster`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('goster'), 3000);
}

// ── PARA FORMATI ──
function tlFormat(sayi) {
  return Number(sayi || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
}

// ── TARİH FORMATI ──
function tarihFormat(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('tr-TR');
}

// ── ROZET HTML ──
function rozet(metin, tip) {
  const tipler = {
    'dolu': 'yesil', 'odendi': 'yesil', 'aktif': 'yesil', 'tamamlandi': 'yesil',
    'bos': 'sari', 'bekliyor': 'sari', 'bakimda': 'sari', 'devam': 'sari',
    'gecikti': 'kirmizi', 'vadeli': 'kirmizi', 'hurda': 'kirmizi', 'acil': 'kirmizi',
    'planlandı': 'mavi', 'emanet': 'mavi', 'alacak': 'mor', 'dusuk': 'yesil',
  };
  const sinif = tip || tipler[metin?.toLowerCase()] || 'mavi';
  return `<span class="rozet rozet-${sinif}">${metin}</span>`;
}

// ── MODAL ──
function modalAc(id) { document.getElementById(id)?.classList.add('acik'); }
function modalKapat(id) { document.getElementById(id)?.classList.remove('acik'); }

// ── YARDIMCILAR ──
function yukleniyorHTML() {
  return '<div class="yukleniyor"><div class="spinner"></div>Yükleniyor...</div>';
}
function bosDurumHTML(mesaj = 'Kayıt bulunamadı') {
  return `<div class="bos-durum"><p>${mesaj}</p></div>`;
}
function silOnay(mesaj, callback) {
  if (confirm(mesaj)) callback();
}

authKontrol();
