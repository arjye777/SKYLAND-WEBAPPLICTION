const express = require('express');
const router = express.Router();
const db = require('../database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Admin middleware
function isAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ ok: false, msg: 'Unauthorized' });
}

// Admin login (same as before)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
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

// ---------------------------
// STATISTICS & ANALYTICS
// ---------------------------
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

router.get('/analytics/room-breakdown', isAdmin, (req, res) => {
  db.bookings.find({}, (err, bookings) => {
    if (err) return res.json({ ok: false });
    const counts = {};
    bookings.forEach(b => { counts[b.room] = (counts[b.room] || 0) + 1; });
    res.json({ ok: true, labels: Object.keys(counts), counts: Object.values(counts) });
  });
});

// ---------------------------
// BOOKINGS MANAGEMENT (Sorted by createdAt ASC)
// ---------------------------
router.get('/bookings', isAdmin, (req, res) => {
  let query = {};
  if (req.query.status) query.status = req.query.status;
  db.bookings.find(query).sort({ createdAt: 1 }).exec(async (err, bookings) => {
    if (err) return res.json({ ok: false });
    // Attach customer names
    const enriched = await Promise.all(bookings.map(b => new Promise(resolve => {
      db.customers.findOne({ _id: b.customer_id }, (err, cust) => {
        b.customer_name = cust ? cust.name : 'Guest';
        resolve(b);
      });
    })));
    // Date filters
    let filtered = enriched;
    if (req.query.from) filtered = filtered.filter(b => b.checkin >= req.query.from);
    if (req.query.to) filtered = filtered.filter(b => b.checkout <= req.query.to);
    res.json({ ok: true, bookings: filtered });
  });
});

// Update booking status (Accept/Confirm or Cancel)
router.put('/bookings/:id', isAdmin, (req, res) => {
  const { status } = req.body;
  db.bookings.update({ _id: req.params.id }, { $set: { status } }, {}, (err) => {
    if (err) return res.json({ ok: false });
    res.json({ ok: true });
  });
});

// Generate PDF receipt for a confirmed booking
router.get('/bookings/:id/receipt', isAdmin, (req, res) => {
  const bookingId = req.params.id;
  db.bookings.findOne({ _id: bookingId }, (err, booking) => {
    if (err || !booking) return res.status(404).send('Booking not found');
    if (booking.status !== 'Confirmed') return res.status(400).send('Receipt only for confirmed bookings');

    db.customers.findOne({ _id: booking.customer_id }, (err, customer) => {
      if (err || !customer) return res.status(404).send('Customer not found');

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const filename = `receipt_${bookingId}.pdf`;
      res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/pdf');
      doc.pipe(res);

      // Header
      doc.fontSize(20).text('SKYLAND HOTEL & RESTAURANT', { align: 'center' });
      doc.fontSize(12).text('Broce St. cor Endrina St., San Carlos City, Negros Occidental', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('BOOKING CONFIRMATION & RECEIPT', { align: 'center', underline: true });
      doc.moveDown();

      // Booking details
      doc.fontSize(12).text(`Receipt No: ${bookingId}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(14).text('Guest Information:', { underline: true });
      doc.fontSize(12).text(`Name: ${customer.name}`);
      doc.text(`Phone: ${customer.phone}`);
      doc.moveDown();

      doc.fontSize(14).text('Booking Details:', { underline: true });
      doc.fontSize(12).text(`Room: ${booking.room}`);
      if (booking.bed_type) doc.text(`Bed Type: ${booking.bed_type}`);
      doc.text(`Check-in: ${booking.checkin}`);
      doc.text(`Check-out: ${booking.checkout}`);
      doc.text(`Number of Guests: ${booking.guests}`);
      doc.moveDown();

      if (booking.fridge_requested || booking.extra_bed_requested) {
        doc.fontSize(12).text('Add-ons:', { underline: true });
        if (booking.fridge_requested) doc.text('• Refrigerator (+₱200)');
        if (booking.extra_bed_requested) doc.text('• Extra Bed (+₱200)');
        doc.moveDown();
      }

      doc.fontSize(14).text(`Total Amount Paid: ₱${booking.total_price.toLocaleString()}`, { align: 'center', bold: true });
      doc.moveDown();
      doc.fontSize(10).text('Thank you for choosing Skyland Hotel!', { align: 'center', italic: true });
      doc.end();
    });
  });
});

// ---------------------------
// MENU MANAGEMENT (unchanged)
// ---------------------------
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

// ---------------------------
// REQUESTS (unchanged)
// ---------------------------
router.get('/requests', isAdmin, (req, res) => {
  db.requests.find({}).sort({ created_at: -1 }).exec((err, requests) => {
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
