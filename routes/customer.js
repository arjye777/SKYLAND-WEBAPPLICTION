const express = require('express');
const db = require('../db/database');
const router = express.Router();

function auth(req, res, next) {
  if (!req.session.user) return res.json({ ok: false, msg: 'Not logged in' });
  next();
}

router.post('/bookings', auth, (req, res) => {
  const { room, price_per_night, checkin, checkout, guests, special_request, bed_type, extras } = req.body;
  if (!room || !checkin || !checkout) return res.json({ ok: false, msg: 'Missing fields' });
  const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  if (nights <= 0) return res.json({ ok: false, msg: 'Invalid dates' });
  const u = req.session.user;
  
  // Calculate total with extras
  let extrasCost = 0;
  let extrasDetail = [];
  if (extras) {
    if (extras.refrigerator) { extrasCost += 200; extrasDetail.push('Refrigerator: ₱200'); }
    if (extras.extra_bed) { extrasCost += 200 * (extras.extra_bed || 1); extrasDetail.push(`Extra Bed(s): ₱${200 * (extras.extra_bed || 1)}`); }
  }
  
  const roomRate = Number(price_per_night);
  const roomTotal = roomRate * nights;
  const total_price = roomTotal + extrasCost;
  
  const doc = { 
    id: 'BK'+Date.now(), 
    user_id: u.id, 
    user_name: u.name, 
    user_email: u.email, 
    user_phone: u.phone,
    room, 
    bed_type: bed_type || 'Twin',
    price_per_night: roomRate, 
    total_price, 
    nights, 
    checkin,
    checkout,
    guests: guests || 1,
    special_request,
    extras: extrasDetail,
    extras_cost: extrasCost,
    room_total: roomTotal,
    status: 'Pending',
    created_at: new Date().toLocaleString()
  };
  
  db.bookings.insert(doc, (err, newDoc) => {
    if (err) return res.json({ ok: false, msg: 'Error saving booking' });
    res.json({ ok: true, id: doc.id, msg: 'Booking submitted!', booking: doc });
  });
});

router.get('/bookings', auth, (req, res) => {
  db.bookings.find({ user_id: req.session.user.id }).sort({ created_at: -1 }).exec((err, docs) => {
    res.json({ ok: true, bookings: docs || [] });
  });
});

router.get('/booking/:id', auth, (req, res) => {
  db.bookings.findOne({ id: req.params.id }, (err, doc) => {
    if (!doc || doc.user_id !== req.session.user.id) return res.json({ ok: false, msg: 'Not found' });
    res.json({ ok: true, booking: doc });
  });
});

// Generate Receipt (after booking confirmed)
router.post('/receipt', auth, (req, res) => {
  const { booking_id } = req.body;
  
  db.bookings.findOne({ id: booking_id }, (err, booking) => {
    if (!booking || booking.user_id !== req.session.user.id) {
      return res.json({ ok: false, msg: 'Booking not found' });
    }
    
    if (booking.status !== 'Confirmed') {
      return res.json({ ok: false, msg: 'Booking must be confirmed first' });
    }
    
    // Check if receipt already exists
    db.receipts.findOne({ booking_id }, (err, existingReceipt) => {
      if (existingReceipt) {
        return res.json({ ok: true, receipt: existingReceipt });
      }
      
      // Generate receipt
      const receipt = {
        receipt_id: 'RCP' + Date.now(),
        booking_id,
        user_name: booking.user_name,
        user_phone: booking.user_phone,
        room_type: booking.room,
        bed_type: booking.bed_type,
        check_in: booking.checkin,
        check_out: booking.checkout,
        nights: booking.nights,
        guests: booking.guests,
        room_rate: booking.price_per_night,
        room_total: booking.room_total,
        extras: booking.extras,
        extras_cost: booking.extras_cost,
        total_amount: booking.total_price,
        special_requests: booking.special_request,
        status: 'Generated',
        generated_at: new Date().toLocaleString(),
        reference_number: 'SKY-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };
      
      db.receipts.insert(receipt, (err, newReceipt) => {
        if (err) return res.json({ ok: false, msg: 'Error generating receipt' });
        res.json({ ok: true, receipt: newReceipt });
      });
    });
  });
});

router.get('/receipt/:id', auth, (req, res) => {
  db.receipts.findOne({ receipt_id: req.params.id }, (err, receipt) => {
    if (!receipt) return res.json({ ok: false, msg: 'Receipt not found' });
    res.json({ ok: true, receipt });
  });
});

router.get('/menu', (req, res) => {
  db.menu.find({ available: true }).sort({ category: 1, name: 1 }).exec((err, docs) => {
    res.json({ ok: true, items: docs || [] });
  });
});

router.post('/orders', auth, (req, res) => {
  const { item_name, quantity, location, note } = req.body;
  if (!item_name) return res.json({ ok: false, msg: 'Select an item' });
  const u = req.session.user;
  const doc = { id: 'ORD'+Date.now(), user_id: u.id, user_name: u.name, item_name, quantity: quantity||1, location: location||'Room Delivery', note: note||'', status: 'Preparing', created_at: new Date().toLocaleString() };
  db.orders.insert(doc, () => res.json({ ok: true, msg: 'Order placed! Estimated 20-30 minutes.' }));
});

router.get('/orders', auth, (req, res) => {
  db.orders.find({ user_id: req.session.user.id }).sort({ created_at: -1 }).exec((err, docs) => {
    res.json({ ok: true, orders: docs || [] });
  });
});

router.post('/requests', auth, (req, res) => {
  const { type, detail } = req.body;
  if (!detail || !detail.trim()) return res.json({ ok: false, msg: 'Please describe your request' });
  const u = req.session.user;
  const doc = { id: 'REQ'+Date.now(), user_id: u.id, user_name: u.name, type: type||'Other', detail, status: 'Pending', admin_note: '', created_at: new Date().toLocaleString() };
  db.requests.insert(doc, () => res.json({ ok: true, msg: 'Request submitted!' }));
});

router.get('/requests', auth, (req, res) => {
  db.requests.find({ user_id: req.session.user.id }).sort({ created_at: -1 }).exec((err, docs) => {
    res.json({ ok: true, requests: docs || [] });
  });
});

module.exports = router;
