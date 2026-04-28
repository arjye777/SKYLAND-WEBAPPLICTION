const Datastore = require('@seald-io/nedb');
const path = require('path');
const bcrypt = require('bcryptjs');

// Ensure db directory exists (if not, NeDB will create files)
const dbDir = path.join(__dirname, 'db');
const db = {};

// Initialize collections
db.customers = new Datastore({ filename: path.join(dbDir, 'customers.db'), autoload: true });
db.bookings = new Datastore({ filename: path.join(dbDir, 'bookings.db'), autoload: true });
db.orders = new Datastore({ filename: path.join(dbDir, 'orders.db'), autoload: true });
db.requests = new Datastore({ filename: path.join(dbDir, 'requests.db'), autoload: true });
db.menu = new Datastore({ filename: path.join(dbDir, 'menu.db'), autoload: true });

// Create default admin user (only if none exists)
db.customers.findOne({ phone: 'admin' }, (err, admin) => {
  if (!admin) {
    bcrypt.hash('admin123', 10, (err, hash) => {
      if (!err) {
        db.customers.insert({
          phone: 'admin',
          name: 'Administrator',
          password: hash,
          isAdmin: true,
          createdAt: new Date()
        });
      }
    });
  }
});

// Insert default menu items if menu collection is empty
db.menu.count({}, (err, count) => {
  if (count === 0) {
    const defaultMenu = [
      { name: 'Adobo', category: 'Filipino', price: 180, description: 'Pork adobo with rice', icon: '🍲' },
      { name: 'Sinigang', category: 'Soup', price: 220, description: 'Sour tamarind soup', icon: '🥣' },
      { name: 'Lechon Kawali', category: 'Crispy', price: 250, description: 'Crispy pork belly', icon: '🥓' },
      { name: 'Chicken Inasal', category: 'Grilled', price: 200, description: 'Grilled chicken', icon: '🍗' },
      { name: 'Halo-Halo', category: 'Dessert', price: 90, description: 'Mixed shaved ice', icon: '🍧' },
      { name: 'Buko Juice', category: 'Beverage', price: 60, description: 'Fresh coconut juice', icon: '🥥' }
    ];
    db.menu.insert(defaultMenu);
  }
});

module.exports = db;
