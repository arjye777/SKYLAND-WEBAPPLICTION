const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.json({ ok: false, msg: 'Please login first' });
}

// Get all menu items
router.get('/menu', (req, res) => {
  db.menu.find({}, (err, items) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, items });
  });
});

// Create a new booking
router.post('/bookings', isLoggedIn, (req, res) => {
  const { room, price_per_night, checkin, checkout, guests, special_request } = req.body;
  if (!room || !price_per_night || !checkin || !checkout || !guests) {
    return res.json({ ok: false, msg: 'Missing required fields' });
  }
  const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  if (nights <= 0) return res.json({ ok: false, msg: 'Check-out must be after check-in' });
  const total_price = price_per_night * nights;
  const newBooking = {
    customer_phone: req.session.user.phone,
    customer_name: req.session.user.name,
    room,
    price_per_night,
    checkin,
    checkout,
    guests: parseInt(guests),
    special_request: special_request || '',
    total_price,
    status: 'Pending',
    created_at: new Date().toISOString()
  };
  db.bookings.insert(newBooking, (err, doc) => {
    if (err) return res.json({ ok: false, msg: 'Booking failed' });
    res.json({ ok: true, msg: 'Booking confirmed!', booking: doc });
  });
});

// Get user's bookings
router.get('/bookings', isLoggedIn, (req, res) => {
  db.bookings.find({ customer_phone: req.session.user.phone }, (err, bookings) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, bookings });
  });
});

// Place an order (restaurant)
router.post('/orders', isLoggedIn, (req, res) => {
  const { item_name, quantity, location, note } = req.body;
  if (!item_name || !quantity) {
    return res.json({ ok: false, msg: 'Item and quantity required' });
  }
  // Find item price from menu
  db.menu.findOne({ name: item_name }, (err, item) => {
    if (err || !item) {
      return res.json({ ok: false, msg: 'Item not found' });
    }
    const total_price = item.price * parseInt(quantity);
    const newOrder = {
      customer_phone: req.session.user.phone,
      customer_name: req.session.user.name,
      item_name,
      quantity: parseInt(quantity),
      location: location || 'Room Delivery',
      note: note || '',
      total_price,
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    db.orders.insert(newOrder, (err, doc) => {
      if (err) return res.json({ ok: false, msg: 'Order failed' });
      res.json({ ok: true, msg: 'Order placed successfully!' });
    });
  });
});

// Get user's orders
router.get('/orders', isLoggedIn, (req, res) => {
  db.orders.find({ customer_phone: req.session.user.phone }, (err, orders) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, orders });
  });
});

// Submit a special request
router.post('/requests', isLoggedIn, (req, res) => {
  const { type, detail } = req.body;
  if (!type || !detail) {
    return res.json({ ok: false, msg: 'Request type and details required' });
  }
  const newRequest = {
    customer_phone: req.session.user.phone,
    customer_name: req.session.user.name,
    type,
    detail,
    status: 'Pending',
    admin_note: '',
    created_at: new Date().toISOString()
  };
  db.requests.insert(newRequest, (err, doc) => {
    if (err) return res.json({ ok: false, msg: 'Failed to submit request' });
    res.json({ ok: true, msg: 'Request submitted' });
  });
});

// Get user's requests
router.get('/requests', isLoggedIn, (req, res) => {
  db.requests.find({ customer_phone: req.session.user.phone }, (err, requests) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, requests });
  });
});

module.exports = router;
