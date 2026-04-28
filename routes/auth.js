const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database');

// Register with phone number
router.post('/register', async (req, res) => {
  const { phone, name, password } = req.body;
  if (!phone || !name || !password) {
    return res.json({ ok: false, msg: 'Phone, name, and password are required' });
  }
  
  // Phone number format validation (basic)
  const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
  if (!phoneRegex.test(phone)) {
    return res.json({ ok: false, msg: 'Invalid phone number format' });
  }
  
  // Check if phone already exists
  db.customers.findOne({ phone }, async (err, existing) => {
    if (err) {
      return res.json({ ok: false, msg: 'Database error' });
    }
    if (existing) {
      return res.json({ ok: false, msg: 'Phone number already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      phone,
      name,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    db.customers.insert(newUser, (err, doc) => {
      if (err) {
        return res.json({ ok: false, msg: 'Failed to create user' });
      }
      res.json({ ok: true, msg: 'Registration successful' });
    });
  });
});

// Login with phone number
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.json({ ok: false, msg: 'Phone and password are required' });
  }
  
  db.customers.findOne({ phone }, async (err, user) => {
    if (err || !user) {
      return res.json({ ok: false, msg: 'Invalid phone number or password' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ ok: false, msg: 'Invalid phone number or password' });
    }
    
    req.session.user = {
      id: user._id,
      name: user.name,
      phone: user.phone
    };
    
    res.json({ ok: true, user: { name: user.name, phone: user.phone } });
  });
});

// Get current logged-in user
router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.json({ ok: true, user: req.session.user });
  }
  res.json({ ok: false });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

module.exports = router;
