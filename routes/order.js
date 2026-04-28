const express = require('express');
const router = express.Router();
const db = require('../database');

// User middleware
function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.json({ ok: false, msg: 'Please login' });
}

// Get user's orders
router.get('/', isLoggedIn, (req, res) => {
  db.orders.find({ customer_phone: req.session.user.phone }, (err, orders) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true, orders });
  });
});

// Place an order
router.post('/', isLoggedIn, (req, res) => {
  const { item_name, quantity, location, note } = req.body;
  db.menu.findOne({ name: item_name }, (err, item) => {
    if (err || !item) return res.json({ ok: false, msg: 'Item not found' });
    const total = item.price * quantity;
    const order = {
      customer_phone: req.session.user.phone,
      customer_name: req.session.user.name,
      item_name,
      quantity,
      location,
      note,
      total_price: total,
      status: 'Pending',
      created_at: new Date()
    };
    db.orders.insert(order, (err) => {
      if (err) return res.json({ ok: false });
      res.json({ ok: true, msg: 'Order placed' });
    });
  });
});

module.exports = router;
