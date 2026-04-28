const express = require('express');
const router = express.Router();
const db = require('../database');

function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.json({ ok: false, msg: 'Login required' });
}

router.get('/', isLoggedIn, (req, res) => {
  db.requests.find({ customer_phone: req.session.user.phone }, (err, requests) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, requests });
  });
});

router.post('/', isLoggedIn, (req, res) => {
  const { type, detail } = req.body;
  const newReq = {
    customer_phone: req.session.user.phone,
    customer_name: req.session.user.name,
    type,
    detail,
    status: 'Pending',
    admin_note: '',
    created_at: new Date().toISOString()
  };
  db.requests.insert(newReq, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, msg: 'Request submitted' });
  });
});

module.exports = router;
