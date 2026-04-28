const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const router = express.Router();

router.post('/register', (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.json({ ok: false, msg: 'All fields required' });
  const phoneRegex = /^(09|\+639)\d{9}$/;
  if (!phoneRegex.test(phone)) return res.json({ ok: false, msg: 'Please enter a valid PH phone number (e.g. 09171234567)' });
  if (password.length < 6) return res.json({ ok: false, msg: 'Password must be at least 6 characters' });
  db.users.findOne({ phone }, (err, doc) => {
    if (doc) return res.json({ ok: false, msg: 'Phone number already registered' });
    db.users.insert({ name, phone, password: bcrypt.hashSync(password, 10), created_at: new Date().toLocaleString() }, (err, newDoc) => {
      res.json({ ok: true, msg: 'Account created! Please sign in.' });
    });
  });
});

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  db.users.findOne({ phone }, (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) return res.json({ ok: false, msg: 'Invalid phone number or password' });
    req.session.user = { id: user._id, name: user.name, phone: user.phone };
    res.json({ ok: true, user: req.session.user });
  });
});

router.post('/logout', (req, res) => { req.session.destroy(); res.json({ ok: true }); });

router.get('/me', (req, res) => {
  if (req.session.user) res.json({ ok: true, user: req.session.user });
  else res.json({ ok: false });
});

module.exports = router;
