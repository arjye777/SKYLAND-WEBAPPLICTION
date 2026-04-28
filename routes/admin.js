const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');

// Admin auth middleware
function isAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ ok: false, message: 'Unauthorized' });
}

// Admin login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Default admin credentials (you can change later)
  if (email === 'admin@skyland.com' && password === 'admin123') {
    req.session.admin = { name: 'Admin' };
    return res.json({ ok: true });
  }
  res.json({ ok: false, msg: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// ========== STATISTICS ==========
router.get('/stats', isAdmin, (req, res) => {
  let total_revenue = 0, total_bookings = 0, active_bookings = 0, total_customers = 0;
  db.bookings.find({}, (err, bookings) => {
    if (err) return res.json({ ok: false });
    total_bookings = bookings.length;
    active_bookings = bookings.filter(b => b.status === 'Confirmed').length;
    total_revenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    db.customers.count({}, (err, count) => {
      total_customers = count;
      res.json({ ok: true, stats: { total_revenue, total_bookings, active_bookings, total_customers } });
    });
  });
});

// Daily revenue (last 7 days)
router.get('/analytics/daily-revenue', isAdmin, (req, res) => {
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();
  db.bookings.find({ status: 'Confirmed' }, (err, bookings) => {
    if (err) return res.json({ ok: false });
    const daily = {};
    bookings.forEach(b => {
      const date = b.checkin.split('T')[0];
      daily[date] = (daily[date] || 0) + (b.total_price || 0);
    });
    const revenues = last7.map(date => daily[date] || 0);
    res.json({ ok: true, dates: last7, revenues });
  });
});

// Room type breakdown
router.get('/analytics/room-breakdown', isAdmin, (req, res) => {
  db.bookings.find({}, (err, bookings) => {
    if (err) return res.json({ ok: false });
    const counts = {};
    bookings.forEach(b => { counts[b.room] = (counts[b.room] || 0) + 1; });
    res.json({ ok: true, labels: Object.keys(counts), counts: Object.values(counts) });
  });
});

// ========== BOOKINGS MANAGEMENT ==========
router.get('/bookings', isAdmin, (req, res) => {
  let query = {};
  if (req.query.status) query.status = req.query.status;
  db.bookings.find(query).sort({ createdAt: -1 }).exec(async (err, bookings) => {
    if (err) return res.json({ ok: false });
    // Attach customer names
    const enriched = await Promise.all(bookings.map(b => new Promise(resolve => {
      db.customers.findOne({ _id: b.customer_id }, (err, cust) => {
        b.customer_name = cust ? cust.name : 'Guest';
        resolve(b);
      });
    })));
    // Apply date filters manually (NeDB doesn't support complex date ranges easily)
    let filtered = enriched;
    if (req.query.from) filtered = filtered.filter(b => b.checkin >= req.query.from);
    if (req.query.to) filtered = filtered.filter(b => b.checkout <= req.query.to);
    res.json({ ok: true, bookings: filtered });
  });
});

router.put('/bookings/:id', isAdmin, (req, res) => {
  const { status } = req.body;
  db.bookings.update({ _id: req.params.id }, { $set: { status } }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});

// ========== MENU MANAGEMENT ==========
router.get('/menu', (req, res) => {
  db.menu.find({}, (err, items) => res.json({ ok: true, items }));
});
router.post('/menu', isAdmin, (req, res) => {
  const { name, category, price, description, icon } = req.body;
  db.menu.insert({ name, category, price, description, icon }, (err, doc) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});
router.put('/menu/:id', isAdmin, (req, res) => {
  const { name, category, price, description, icon } = req.body;
  db.menu.update({ _id: req.params.id }, { $set: { name, category, price, description, icon } }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});
router.delete('/menu/:id', isAdmin, (req, res) => {
  db.menu.remove({ _id: req.params.id }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});

// ========== REQUESTS ==========
router.get('/requests', isAdmin, (req, res) => {
  db.requests.find({}).sort({ createdAt: -1 }).exec((err, requests) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, requests });
  });
});
router.put('/requests/:id', isAdmin, (req, res) => {
  const { status } = req.body;
  db.requests.update({ _id: req.params.id }, { $set: { status } }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});

module.exports = router;
