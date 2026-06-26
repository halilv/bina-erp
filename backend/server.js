require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/daireler', require('./routes/daireler'));
app.use('/api/aidat', require('./routes/aidat'));
app.use('/api/borc-alacak', require('./routes/borcAlacak'));
app.use('/api/demirbas', require('./routes/demirbas'));
app.use('/api/bakim', require('./routes/bakim'));
app.use('/api/muhasebe', require('./routes/muhasebe'));
app.use('/api/raporlar', require('./routes/raporlar'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log('Bina ERP sunucusu calisiyor: ' + PORT);
});
