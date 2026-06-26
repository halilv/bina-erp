require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'https://halilv.github.io',
    /\.onrender\.com$/,
    /\.github\.io$/,
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend statik dosyalar
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/daireler', require('./routes/daireler'));
app.use('/api/aidat', require('./routes/aidat'));
app.use('/api/borc-alacak', require('./routes/borcAlacak'));
app.use('/api/demirbas', require('./routes/demirbas'));
app.use('/api/raporlar', require('./routes/raporlar'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Sunucu Hatası:', err.stack);
  res.status(500).json({ hata: 'Beklenmedik bir sunucu hatası oluştu' });
});

app.listen(PORT, () => {
  console.log(`\n✅ Bina ERP sunucusu çalışıyor`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api\n`);
});
