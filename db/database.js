const Datastore = require('@seald-io/nedb');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = {};

// Initialize collections
db.customers = new Datastore({ filename: path.join(__dirname, '../db/customers.db'), autoload: true });
db.bookings = new Datastore({ filename: path.join(__dirname, '../db/bookings.db'), autoload: true });
db.orders = new Datastore({ filename: path.join(__dirname, '../db/orders.db'), autoload: true });
db.requests = new Datastore({ filename: path.join(__dirname, '../db/requests.db'), autoload: true });
db.menu = new Datastore({ filename: path.join(__dirname, '../db/menu.db'), autoload: true });
db.admin = new Datastore({ filename: path.join(__dirname, '../db/admin.db'), autoload: true });

// Create default admin if none exists
db.admin.findOne({ username: 'admin' }, async (err, admin) => {
  if (!admin) {
    const hashed = await bcrypt.hash('admin123', 10);
    db.admin.insert({ username: 'admin', password: hashed });
    console.log('Default admin created: admin / admin123');
  }
});

// Create default menu items if empty
db.menu.count({}, (err, count) => {
  if (count === 0) {
    const defaultMenu = [
      { name: 'Adobo', price: 180, category: 'Filipino', description: 'Pork adobo with rice', icon: '🍲' },
      { name: 'Sinigang', price: 220, category: 'Filipino', description: 'Sour tamarind soup', icon: '🥣' },
      { name: 'Lumpia', price: 120, category: 'Appetizer', description: 'Spring rolls', icon: '🌯' },
      { name: 'Lechon Kawali', price: 250, category: 'Filipino', description: 'Crispy pork belly', icon: '🍖' },
      { name: 'Halo-Halo', price: 90, category: 'Dessert', description: 'Shaved ice dessert', icon: '🍧' },
      { name: 'Pancit Canton', price: 150, category: 'Noodles', description: 'Stir-fried noodles', icon: '🍜' }
    ];
    db.menu.insert(defaultMenu);
    console.log('Default menu added');
  }
});

module.exports = db;
