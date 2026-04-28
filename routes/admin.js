const express = require('express');
const router = express.Router();
const db = require('../database');

// Admin middleware
function isAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.json({ ok: false, msg: 'Admin access required' });
}

// Admin login (unchanged, uses separate admin collection)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // In production, compare with hashed password from .env or admin collection
  if (username === process.env.ADMIN_USERNAME || username === 'admin' && password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    req.session.admin = { username };
    res.json({ ok: true });
  } else {
    res.json({ ok: false, msg: 'Invalid admin credentials' });
  }
});

// Get all bookings (admin)
router.get('/bookings', isAdmin, (req, res) => {
  const { status } = req.query;
  let query = {};
  if (status) query.status = status;
  db.bookings.find(query, (err, bookings) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, bookings });
  });
});

// Update booking status (admin)
router.put('/bookings/:id', isAdmin, (req, res) => {
  const { status } = req.body;
  db.bookings.update({ _id: req.params.id }, { $set: { status } }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});

// Get all orders (admin)
router.get('/orders', isAdmin, (req, res) => {
  db.orders.find({}, (err, orders) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, orders });
  });
});

// Update order status
router.put('/orders/:id', isAdmin, (req, res) => {
  const { status } = req.body;
  db.orders.update({ _id: req.params.id }, { $set: { status } }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});

// Get all requests (admin)
router.get('/requests', isAdmin, (req, res) => {
  db.requests.find({}, (err, requests) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, requests });
  });
});

// Update request status and add admin note
router.put('/requests/:id', isAdmin, (req, res) => {
  const { status, admin_note } = req.body;
  const update = { status };
  if (admin_note) update.admin_note = admin_note;
  db.requests.update({ _id: req.params.id }, { $set: update }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});

// Dashboard stats (admin)
router.get('/stats', isAdmin, (req, res) => {
  db.bookings.find({}, (err, bookings) => {
    if (err) return res.json({ ok: false });
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    
    db.customers.count({}, (err, customerCount) => {
      db.orders.find({}, (err, orders) => {
        const totalOrders = orders.length;
        res.json({
          ok: true,
          stats: {
            totalBookings,
            confirmedBookings,
            totalRevenue,
            totalCustomers: customerCount,
            totalOrders
          }
        });
      });
    });
  });
});

module.exports = router;
