const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database');

// REGISTER (phone, name, password)
router.post('/register', async (req, res) => {
  const { phone, name, password } = req.body;
  if (!phone || !name || !password) {
    return res.json({ ok: false, msg: 'Phone, name and password required' });
  }
  const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
  if (!phoneRegex.test(phone)) {
    return res.json({ ok: false, msg: 'Invalid phone number format' });
  }
  db.customers.findOne({ phone }, async (err, existing) => {
    if (err) return res.json({ ok: false, msg: 'Database error' });
    if (existing) return res.json({ ok: false, msg: 'Phone number already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { phone, name, password: hashed, createdAt: new Date() };
    db.customers.insert(newUser, (err, doc) => {
      if (err) return res.json({ ok: false, msg: 'Registration failed' });
      res.json({ ok: true, msg: 'Registration successful' });
    });
  });
});

// LOGIN (phone, password)
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.json({ ok: false, msg: 'Phone and password required' });
  db.customers.findOne({ phone }, async (err, user) => {
    if (err || !user) return res.json({ ok: false, msg: 'Invalid phone or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ ok: false, msg: 'Invalid phone or password' });
    req.session.user = { id: user._id, name: user.name, phone: user.phone };
    res.json({ ok: true, user: { id: user._id, name: user.name, phone: user.phone } });
  });
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// GET CURRENT USER
router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.json({ ok: true, user: req.session.user });
  }
  res.json({ ok: false });
});

module.exports = router;
