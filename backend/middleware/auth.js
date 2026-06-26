const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ hata: 'Giriş yapmanız gerekiyor' });
  }

  try {
    const kullanici = jwt.verify(token, process.env.JWT_SECRET);
    req.kullanici = kullanici;
    next();
  } catch (err) {
    return res.status(403).json({ hata: 'Geçersiz veya süresi dolmuş token' });
  }
};
