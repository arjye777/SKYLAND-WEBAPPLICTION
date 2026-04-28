const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ ok: false, msg: 'Please login first' });
}

// ---------------------------
// BOOKINGS (Customer)
// ---------------------------

// Get all bookings for the logged-in customer
router.get('/bookings', isLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  db.bookings.find({ customer_id: userId }).sort({ createdAt: -1 }).exec((err, bookings) => {
    if (err) return res.json({ ok: false, msg: 'Database error' });
    res.json({ ok: true, bookings });
  });
});

// Check room availability for a given date range
router.post('/check-availability', (req, res) => {
  const { room, checkin, checkout } = req.body;
  if (!room || !checkin || !checkout) return res.json({ ok: false, msg: 'Missing data' });
  db.bookings.find({ room, status: 'Confirmed', checkin: { $lte: checkout }, checkout: { $gte: checkin } }, (err, conflicting) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, available: conflicting.length === 0 });
  });
});

// Create a new booking (status = 'Pending')
router.post('/bookings', isLoggedIn, (req, res) => {
  const { room, price_per_night, checkin, checkout, guests, total_price, bed_type, fridge_requested, extra_bed_requested, special_request } = req.body;
  if (!room || !checkin || !checkout) return res.json({ ok: false, msg: 'Missing required fields' });

  // First check availability
  db.bookings.find({ room, status: 'Confirmed', checkin: { $lte: checkout }, checkout: { $gte: checkin } }, (err, conflicts) => {
    if (err) return res.json({ ok: false, msg: 'Availability check failed' });
    if (conflicts.length > 0) return res.json({ ok: false, msg: 'Room not available for selected dates' });

    const newBooking = {
      customer_id: req.session.user.id,
      room,
      price_per_night,
      checkin,
      checkout,
      guests: parseInt(guests),
      total_price: parseFloat(total_price),
      bed_type: bed_type || 'Twin/Double',
      fridge_requested: fridge_requested || false,
      extra_bed_requested: extra_bed_requested || false,
      special_request: special_request || '',
      status: 'Pending',
      createdAt: new Date()
    };
    db.bookings.insert(newBooking, (err, doc) => {
      if (err) return res.json({ ok: false, msg: 'Booking failed' });
      res.json({ ok: true, msg: 'Booking submitted! Awaiting admin approval.' });
    });
  });
});

// ---------------------------
// ORDERS
// ---------------------------
router.post('/orders', isLoggedIn, (req, res) => {
  const { item_name, quantity, location, note } = req.body;
  if (!item_name || !quantity) return res.json({ ok: false, msg: 'Missing fields' });
  const order = {
    customer_id: req.session.user.id,
    item_name,
    quantity: parseInt(quantity),
    location: location || 'Room Delivery',
    note: note || '',
    status: 'Pending',
    createdAt: new Date()
  };
  db.orders.insert(order, (err) => {
    if (err) return res.json({ ok: false, msg: 'Order failed' });
    res.json({ ok: true, msg: 'Order placed!' });
  });
});

// ---------------------------
// REQUESTS
// ---------------------------
router.post('/requests', isLoggedIn, (req, res) => {
  const { type, detail } = req.body;
  if (!type || !detail) return res.json({ ok: false, msg: 'Missing fields' });
  const request = {
    customer_id: req.session.user.id,
    type,
    detail,
    status: 'Pending',
    admin_note: '',
    created_at: new Date().toISOString()
  };
  db.requests.insert(request, (err) => {
    if (err) return res.json({ ok: false, msg: 'Request failed' });
    res.json({ ok: true, msg: 'Request submitted' });
  });
});

router.get('/requests', isLoggedIn, (req, res) => {
  db.requests.find({ customer_id: req.session.user.id }).sort({ created_at: -1 }).exec((err, requests) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, requests });
  });
});

// ---------------------------
// MENU
// ---------------------------
router.get('/menu', (req, res) => {
  db.menu.find({}, (err, items) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, items });
  });
});

module.exports = router;
