const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Enhanced chatbot knowledge base with hotel-specific information
const knowledgeBase = [
  {
    category: 'booking',
    keywords: ['book', 'booking', 'reserve', 'reservation', 'room', 'stay', 'check in', 'check out', 'how to book'],
    responses: [
      'I can help you with bookings! 🛏️ Visit the "Book Rooms" section to reserve your stay. We offer:\n• Normal Room — ₱1,500/night\n• Suite Room — ₱3,500/night\n• Deluxe Room — ₱2,800/night\n• King\'s Room — ₱5,500/night',
      'Ready to book? Click on any room and select your check-in and check-out dates. Our booking process takes less than 2 minutes!',
      'Special requests? You can add any special requests during booking (early arrival, late checkout, extra beds, etc.)'
    ]
  },
  {
    category: 'menu',
    keywords: ['menu', 'food', 'order', 'restaurant', 'eat', 'dining', 'breakfast', 'lunch', 'dinner', 'food order'],
    responses: [
      '🍽️ Our Skyland Mini Restaurant is open 6AM–10PM daily! We offer:\n• Filipino Favorites\n• International Cuisine\n• Desserts & Beverages\nOrder via the Restaurant tab — we deliver to your room, dining hall, or poolside.',
      'Craving something specific? Browse our full menu in the Restaurant section. We can accommodate most dietary preferences!',
      'Room service available! 24/7 delivery to your accommodation. Special instructions? We\'ll follow them exactly!'
    ]
  },
  {
    category: 'pricing',
    keywords: ['price', 'cost', 'rate', 'how much', 'fee', 'charge', 'payment', 'expensive', 'afford'],
    responses: [
      '💰 Skyland Pricing:\n🛏️ Normal Room: ₱1,500/night\n🌟 Suite Room: ₱3,500/night\n👑 Deluxe Room: ₱2,800/night\n🏰 King\'s Room: ₱5,500/night\n\nAll rates include complimentary WiFi & breakfast!',
      'We accept Visa, Mastercard, GCash, PayMaya & cash. Payment is processed at check-in.',
      'Early bird discounts available! Book 30 days in advance for 15% off.'
    ]
  },
  {
    category: 'checkin_checkout',
    keywords: ['check in', 'check out', 'checkin', 'checkout', 'arrival', 'departure', 'early', 'late', 'time'],
    responses: [
      '✅ Standard Times:\n🔑 Check-in: 2:00 PM\n🔓 Check-out: 12:00 PM (noon)\n\nNeed early check-in or late checkout? Submit a request in the Requests tab!',
      'Early arrival? We can arrange early check-in subject to availability (₱500 fee applies).',
      'Staying longer? Late checkout until 6 PM is available (₱800 charge) or full-day extension (₱2,500).'
    ]
  },
  {
    category: 'facilities',
    keywords: ['pool', 'spa', 'gym', 'facilities', 'amenities', 'parking', 'wifi', 'internet', 'concierge', 'what\'s available'],
    responses: [
      '🏨 Skyland Hotel Amenities:\n🏊 Infinity Pool (10th floor, 6AM–9PM)\n💆 Spa & Wellness (9AM–8PM)\n🏋️ 24/7 Fitness Center\n🅿️ Free Underground Parking\n📶 Free High-Speed WiFi\n🛎️ 24/7 Concierge Service\n🍽️ Restaurant & Bar\n🎰 Business Center',
      'Free WiFi in all areas! Network: "Skyland_Guest" — no password needed.',
      'Infinity Pool on the 10th floor is perfect for relaxation. King\'s Room guests enjoy exclusive private pool access!'
    ]
  },
  {
    category: 'spa',
    keywords: ['spa', 'massage', 'wellness', 'relax', 'treatment', 'therapy', 'body care'],
    responses: [
      '💆 Spa & Wellness Services:\n• Swedish Massage (60 min: ₱1,500)\n• Aromatherapy (45 min: ₱1,000)\n• Facial Treatments (50 min: ₱1,200)\n• Body Scrub (60 min: ₱1,300)\n\nOpen 9AM–8PM. Book in advance via the Requests tab or call reception!',
      'Relax and rejuvenate! Our certified therapists use premium products. Special couple packages available.',
      'First-time guest? Get 10% off your first spa service!'
    ]
  },
  {
    category: 'parking',
    keywords: ['parking', 'car', 'vehicle', 'garage', 'valet', 'drive'],
    responses: [
      '🅿️ Free Parking Available!\n• Underground parking for all guests\n• Climate-controlled\n• 24/7 Security\n• Complimentary valet service\n\nNotify reception upon arrival for valet assistance.',
      'Safe & secure parking included with your stay. No additional charges!',
      'Valet parking available 24/7. Our team will take care of your vehicle.'
    ]
  },
  {
    category: 'requests',
    keywords: ['request', 'help', 'assistance', 'support', 'need', 'help me', 'can you', 'special request'],
    responses: [
      '📝 Special Requests Available:\n• Extra Bed\n• Extra Towels\n• Room Cleaning\n• Late Checkout\n• Early Check-in\n• Airport Transfer\n• Tour Arrangements\n\nSubmit anytime in the Requests tab — our team responds within 30 minutes!',
      'Our concierge team is ready to help! Submit your request and we\'ll arrange everything.',
      'Something special needed? We\'ll do our best to accommodate! Use the Requests tab.'
    ]
  },
  {
    category: 'contact',
    keywords: ['contact', 'phone', 'email', 'call', 'reach', 'support', 'help desk', 'customer service'],
    responses: [
      '📞 Contact Skyland Hotel:\n📱 Front Desk: +63 2 8000 1234\n📧 Email: reservations@skylandhotel.com\n💬 Chat: 24/7 via this bot\n🕐 Available 24/7, 365 days/year',
      'Direct line to our team! We\'re always here to help.',
      'Prefer email? reservations@skylandhotel.com — we respond within 1 hour.'
    ]
  },
  {
    category: 'cancellation',
    keywords: ['cancel', 'cancellation', 'refund', 'policy', 'cancel booking'],
    responses: [
      '📋 Cancellation Policy:\n✅ 48+ hours before arrival: Full refund\n⚠️ 24-48 hours: 50% refund\n❌ Less than 24 hours: No refund\n❌ No-show: Full charge\n\nManage bookings in "My Bookings" section.',
      'Need to cancel? Do it from your dashboard anytime. Free cancellation within 48 hours!',
      'Modify your dates? You can reschedule without penalty up to 7 days before check-in.'
    ]
  },
  {
    category: 'reviews',
    keywords: ['review', 'rating', 'feedback', 'experience', 'opinion', 'rate us'],
    responses: [
      '⭐ Love your stay? Share your feedback! Your reviews help us improve.',
      'Your experience matters! Rate us after checkout and help future guests discover Skyland.',
      'Had an issue? Please let us know so we can make it right!'
    ]
  },
  {
    category: 'loyalty',
    keywords: ['loyalty', 'member', 'points', 'rewards', 'vip', 'discount', 'frequent'],
    responses: [
      '🎁 Loyalty Program:\n• Earn points on every booking\n• 100 points = ₱500 discount\n• VIP members get 20% off\n• Exclusive rates for repeat guests\n\nAsk about membership benefits!',
      'Frequent visitor? Join our loyalty program for exclusive perks and discounts!',
      'Earn points with every stay and redeem for future bookings!'
    ]
  },
  {
    category: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'welcome'],
    responses: [
      'Hello! 👋 Welcome to Skyland Hotel! How can I assist you today?',
      'Hi there! 🏨 I\'m your Skyland Hotel assistant. What can I help you with?',
      'Welcome to Skyland! 😊 I\'m here 24/7. Ask me anything about bookings, dining, facilities, or your stay.'
    ]
  },
  {
    category: 'gratitude',
    keywords: ['thank', 'thanks', 'appreciate', 'grateful', 'awesome', 'great', 'thank you'],
    responses: [
      'You\'re welcome! 😊 Happy to help. Is there anything else I can assist with?',
      'My pleasure! Feel free to ask if you need anything else during your stay.',
      'Glad I could help! Enjoy your time at Skyland Hotel! ✨'
    ]
  },
  {
    category: 'farewell',
    keywords: ['bye', 'goodbye', 'see you', 'exit', 'close', 'that\'s all', 'later'],
    responses: [
      'Goodbye! 👋 We hope to see you soon at Skyland Hotel! ✨',
      'Safe travels! Thank you for choosing Skyland Hotel.',
      'Have a wonderful day! Looking forward to your next visit! 🏨'
    ]
  },
  {
    category: 'rooms',
    keywords: ['normal room', 'suite room', 'deluxe', 'king room', 'room types', 'which room', 'difference'],
    responses: [
      '🛏️ Room Types:\n• Normal: Queen bed, AC, TV, WiFi (₱1,500)\n• Suite: City view, jacuzzi, minibar (₱3,500)\n• Deluxe: Balcony, smart TV, bathtub (₱2,800)\n• King: Private pool, butler, lounge (₱5,500)\n\nChoose what fits your needs!',
      'Each room offers luxury comfort. Tell me your preferences and I\'ll recommend the best option!',
      'All rooms include breakfast, WiFi, and access to all hotel facilities.'
    ]
  },
  {
    category: 'covid',
    keywords: ['covid', 'vaccine', 'mask', 'sanitize', 'health', 'safety', 'protocol'],
    responses: [
      '🏥 Health & Safety:\n• Sanitized rooms between guests\n• Hand sanitizers available everywhere\n• Contactless check-in available\n• Staff fully vaccinated\n• Masks optional but recommended in common areas',
      'Your safety is our priority! We follow all health guidelines strictly.',
      'Please inform us of any health concerns upon arrival.'
    ]
  },
  {
    category: 'events',
    keywords: ['event', 'meeting', 'conference', 'party', 'celebration', 'wedding', 'function'],
    responses: [
      '🎉 Event Spaces Available:\n• Conference Room (50 pax)\n• Ballroom (200+ pax)\n• Private Dining (30 pax)\n• Outdoor Terrace (100 pax)\n\nContact us for custom packages!',
      'Planning an event? We can host conferences, weddings, parties, and more!',
      'Let our events team create an unforgettable experience. Call or email us!'
    ]
  }
];

// Get a random response from a category
function getRandomResponse(category) {
  const responses = category.responses || [];
  return responses[Math.floor(Math.random() * responses.length)] || 'How can I help you today?';
}

// Find matching category from user message
function findMatchingCategory(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const category of knowledgeBase) {
    if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }
  
  return null;
}

// Chat message endpoint
router.post('/message', (req, res) => {
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return res.json({ 
      ok: false, 
      msg: 'Message cannot be empty' 
    });
  }

  try {
    const matchedCategory = findMatchingCategory(message);
    let botReply;

    if (matchedCategory) {
      botReply = getRandomResponse(matchedCategory);
    } else {
      // Default response when no match found
      botReply = 'I\'m not sure about that, but our team can help! 🤔\n\nYou can ask me about:\n• 🛏️ Room bookings & pricing\n• 🍽️ Restaurant & food orders\n• 💆 Spa & wellness\n• 🏊 Facilities & amenities\n• 📝 Special requests\n• 💬 Or chat with our team directly!\n\nReach us: +63 2 8000 1234 or reservations@skylandhotel.com';
    }

    res.json({ 
      ok: true, 
      reply: botReply,
      category: matchedCategory ? matchedCategory.category : 'unknown'
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.json({ 
      ok: false, 
      msg: 'Error processing message' 
    });
  }
});

// Get chatbot info endpoint
router.get('/info', (req, res) => {
  res.json({
    ok: true,
    bot: {
      name: '🤖 Skyland Assistant',
      availability: '24/7',
      languages: 'English, Tagalog',
      capabilities: [
        'Booking information',
        'Room pricing',
        'Facility details',
        'Restaurant menu info',
        'Special requests',
        'General support'
      ]
    }
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true, status: 'Chatbot service running' });
});

module.exports = router;
