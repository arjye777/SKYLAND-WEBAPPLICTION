const express = require('express');
const router = express.Router();

// Comprehensive Knowledge Base for Hotel Chatbot
const knowledgeBase = [
  {
    category: 'booking',
    keywords: ['book', 'booking', 'reserve', 'reservation', 'room', 'stay', 'check in', 'check out', 'reserve room'],
    responses: [
      '🛏️ Welcome to Skyland Hotel Booking!\n\nWe offer 4 room types:\n• Normal Room: ₱1,500/night\n• Suite Room: ₱3,500/night\n• Deluxe Room: ₱2,800/night\n• King\'s Room: ₱5,500/night\n\nStandard Check-in: 2:00 PM | Check-out: 12:00 PM\n\nWould you like to book now?',
      'To make a booking:\n1. Click "Book Rooms" tab\n2. Select your room type\n3. Choose check-in & check-out dates\n4. Add special requests (optional)\n5. Complete payment\n\nBooking takes just 2 minutes!',
      'Need help with your booking? I can assist with:\n✓ Room availability\n✓ Pricing information\n✓ Special requests\n✓ Early/late checkout options'
    ]
  },
  {
    category: 'menu',
    keywords: ['menu', 'food', 'order', 'restaurant', 'eat', 'dining', 'breakfast', 'lunch', 'dinner', 'cafe'],
    responses: [
      '🍽️ Skyland Mini Restaurant\n\nOperating Hours: 6AM - 10PM Daily\n\nMenu Highlights:\n✓ Filipino Cuisine\n✓ International Dishes\n✓ Desserts & Pastries\n✓ Beverages & Juices\n✓ Healthy Options\n\nOrder via "Restaurant" tab or call Room Service!',
      'Room service available 24/7! 🚚\n\nDelivery options:\n• Room Delivery\n• Dining Hall\n• Poolside Service\n• To-go Orders\n\nSpecial dietary needs? We can accommodate!',
      'Our Chef specializes in:\n🍲 Traditional Filipino dishes\n🍝 Italian cuisine\n🥗 Healthy & vegetarian options\n🍰 Homemade desserts\n☕ Premium beverages'
    ]
  },
  {
    category: 'pricing',
    keywords: ['price', 'cost', 'rate', 'how much', 'fee', 'charge', 'payment', 'rupees', '₱', 'peso'],
    responses: [
      '💰 Skyland Hotel Pricing:\n\n🛏️ Room Rates (per night):\n• Normal Room: ₱1,500\n• Suite Room: ₱3,500\n• Deluxe Room: ₱2,800\n• King\'s Room: ₱5,500\n\n✓ All rates include WiFi & breakfast!\n✓ Early bird discount: 15% off (book 30 days ahead)',
      'Payment Methods Accepted:\n💳 Visa & Mastercard\n📱 GCash & PayMaya\n💵 Cash at check-in\n🏦 Bank Transfer\n\nSecure & encrypted transactions guaranteed!',
      'Additional Service Charges:\n🅿️ Parking: FREE\n🛎️ Concierge: FREE\n🏊 Pool: FREE\n📶 WiFi: FREE\n💆 Spa Services: Starting at ₱1,000'
    ]
  },
  {
    category: 'checkin_checkout',
    keywords: ['check in', 'check out', 'checkin', 'checkout', 'arrival', 'departure', 'early', 'late', 'time'],
    responses: [
      '⏰ Check-in & Check-out Times:\n\n✅ Standard Check-in: 2:00 PM\n✅ Standard Check-out: 12:00 PM (noon)\n\nSpecial Arrangements:\n🔑 Early Check-in: Available (₱500 fee)\n🔓 Late Checkout: Until 6 PM (₱800)\n📅 Full Day Extension: ₱2,500\n\nSubmit requests in the "Requests" tab!',
      'Early Arrival Planning:\n✓ Submit early check-in request 48 hours in advance\n✓ Subject to room availability\n✓ ₱500 convenience fee applies\n✓ Baggage storage available for free\n\nRequest now via Requests tab!',
      'Late Checkout Options:\n⏱️ Until 6 PM: ₱800\n🌙 Until midnight: ₱1,500\n🌅 Full next day: ₱2,500\n\nBook in advance for guaranteed availability!'
    ]
  },
  {
    category: 'facilities',
    keywords: ['pool', 'spa', 'gym', 'facilities', 'amenities', 'parking', 'wifi', 'internet', 'concierge', 'business center'],
    responses: [
      '🏨 Skyland Hotel Amenities:\n\n🏊 Infinity Pool (10th floor, 6AM-9PM)\n💆 Spa & Wellness Center (9AM-8PM)\n🏋️ 24/7 Fitness Center\n🅿️ Free Underground Parking\n📶 Free High-Speed WiFi\n🛎️ 24/7 Concierge Service\n🍽️ Restaurant & Lounge\n💼 Business Center\n🎰 Event Spaces Available',
      'Premium Facilities Included:\n✓ Complimentary WiFi throughout hotel\n✓ Free parking for all guests\n✓ 24/7 concierge assistance\n✓ Express laundry service (same-day)\n✓ Airport transfers available\n✓ Tour desk for city tours',
      'Exclusive King\'s Room Perks:\n👑 Private infinity pool access\n🛎️ Personal butler service\n🍾 Complimentary welcome drink\n📞 Priority concierge\n✨ Room upgrade guarantee'
    ]
  },
  {
    category: 'spa',
    keywords: ['spa', 'massage', 'wellness', 'relax', 'treatment', 'therapy', 'facial', 'body'],
    responses: [
      '💆 Spa & Wellness Services:\n\n⏰ Operating Hours: 9AM - 8PM\n📍 Location: 5th Floor\n\n💅 Available Services:\n• Swedish Massage (60 min): ₱1,500\n• Aromatherapy (45 min): ₱1,000\n• Facial Treatment (50 min): ₱1,200\n• Body Scrub (60 min): ₱1,300\n• Reflexology (30 min): ₱800\n\n📞 Book via Requests tab or call reception!',
      'Spa Package Deals:\n🎁 Couple\'s Package: ₱2,500/person\n🎁 Relaxation Package: ₱2,800\n🎁 Premium Package: ₱5,000\n\n10% discount for first-time guests!\nBook 24 hours in advance for best availability.',
      'Our Professional Therapists:\n✓ Certified & experienced\n✓ Use premium products only\n✓ Customized treatments\n✓ Clean & hygienic facilities\n✓ Confidential & private rooms\n\nRelax and rejuvenate your body & mind!'
    ]
  },
  {
    category: 'parking',
    keywords: ['parking', 'car', 'vehicle', 'garage', 'valet', 'parking fee', 'park'],
    responses: [
      '🅿️ FREE Parking Available:\n\n✅ Underground Parking Facility\n✅ Climate-Controlled Environment\n✅ 24/7 Security Monitoring\n✅ CCTV Surveillance\n✅ Complimentary Valet Service\n✅ No Additional Charges\n\n📍 Let our team know your vehicle details at check-in!',
      'Valet Parking Service (24/7):\n✓ Professional valet attendants\n✓ Safe vehicle handling\n✓ Quick access & retrieval\n✓ Secure storage\n✓ Complimentary service\n\nNotify reception for valet assistance anytime!',
      'Guest Parking Info:\n📋 Underground garage\n🚗 Reserved spot for your stay\n🔒 Security gates & guards\n💨 Ventilated parking area\n🚙 Easy vehicle access\n\nNo worry about your vehicle! We\'ll take care of it.'
    ]
  },
  {
    category: 'requests',
    keywords: ['request', 'help', 'assistance', 'support', 'need', 'help me', 'can you', 'i need', 'problem', 'issue'],
    responses: [
      '📝 Special Requests Available:\n\nCommon Requests:\n🛏️ Extra Bed/Cot\n🧴 Extra Towels/Toiletries\n🧹 Room Cleaning Service\n⏱️ Late Checkout\n🔑 Early Check-in\n🚗 Airport Transfer\n🗺️ Tour Arrangements\n🍽️ Dining Recommendations\n\n⚡ Response Time: Within 30 minutes!\nSubmit anytime in your dashboard.',
      'How to Submit Requests:\n1. Go to "Requests" section\n2. Select request type\n3. Add description & details\n4. Submit request\n5. Get confirmation in 30 minutes\n\nOur team works 24/7 to help you!',
      'Emergency Assistance Available:\n🚨 24/7 Front Desk\n☎️ Direct extension: 0\n🚑 Medical assistance\n🔧 Maintenance support\n🛡️ Security assistance\n\nWe\'re always here for you!'
    ]
  },
  {
    category: 'contact',
    keywords: ['contact', 'phone', 'email', 'call', 'reach', 'support', 'help desk', 'telephone', 'number'],
    responses: [
      '📞 Contact Skyland Hotel:\n\n📱 Front Desk: +63 2 8000-1234\n📧 Email: reservations@skylandhotel.com\n💬 Live Chat: 24/7 via this bot\n🕐 Available: 24/7, 365 days/year\n\n⚡ Average Response Time:\n📧 Email: 1 hour\n📞 Phone: Immediate\n💬 Chat: 2-5 minutes',
      'Reach Us By:\n✓ Phone (fastest)\n✓ Email (detailed inquiries)\n✓ Chat (quick questions)\n✓ In-person at front desk\n✓ Requests tab in dashboard\n\nWe respond to all inquiries within 1 hour!',
      'Department Extensions:\n🛏️ Reservations: Ext. 101\n🍽️ Restaurant: Ext. 102\n💆 Spa & Wellness: Ext. 103\n🛎️ Concierge: Ext. 104\n👔 Guest Services: Ext. 105\n🔧 Maintenance: Ext. 0'
    ]
  },
  {
    category: 'cancellation',
    keywords: ['cancel', 'cancellation', 'refund', 'policy', 'change', 'modify', 'reschedule'],
    responses: [
      '📋 Cancellation Policy:\n\n✅ 48+ hours before arrival:\nFULL REFUND (100%)\n\n⚠️ 24-48 hours before arrival:\nPARTIAL REFUND (50%)\n\n❌ Less than 24 hours:\nNO REFUND\n\n❌ No-show:\nFULL CHARGE (100%)\n\nManage bookings in "My Bookings" anytime!',
      'How to Cancel/Reschedule:\n1. Go to "My Bookings"\n2. Select booking to modify\n3. Click "Cancel" or "Reschedule"\n4. Confirm changes\n5. Refund processed within 5 business days\n\nFree cancellation up to 48 hours!',
      'Flexible Rebooking:\n✓ Change dates without penalty (48+ hours)\n✓ Transfer booking to another guest\n✓ Extend stay at discounted rates\n✓ Upgrade room type with fee\n\nContact us for special arrangements!'
    ]
  },
  {
    category: 'reviews',
    keywords: ['review', 'rating', 'feedback', 'experience', 'opinion', 'rate', 'comment', 'suggestion'],
    responses: [
      '⭐ Your Feedback Matters!\n\nWe\'d love to hear about your stay!\n\n✍️ Share Your Experience:\n✓ Rate your stay (1-5 stars)\n✓ Write detailed feedback\n✓ Suggest improvements\n✓ Highlight best services\n✓ Upload photos\n\n🎁 Leave a review & get:\n• 10% discount on next booking\n• Loyalty points (100 pts)\n• Special surprise gifts!\n\nReview links sent after checkout.',
      'Recent Guest Reviews:\n⭐⭐⭐⭐⭐ "Amazing service & beautiful rooms!"\n⭐⭐⭐⭐⭐ "Best hotel experience in the city!"\n⭐⭐⭐⭐⭐ "Friendly staff, clean rooms, highly recommended!"\n\nYour review could be featured next!\nShare your experience today!',
      'Quality Assurance:\n📊 We monitor all feedback\n✅ Continuous improvements\n🎯 Staff training based on reviews\n💡 Implement guest suggestions\n🏆 Annual excellence awards\n\nYour opinion drives our excellence!'
    ]
  },
  {
    category: 'loyalty',
    keywords: ['loyalty', 'member', 'points', 'rewards', 'vip', 'discount', 'frequent', 'card'],
    responses: [
      '🎁 Skyland Loyalty Program:\n\n💎 Membership Benefits:\n✓ Earn 100 points per booking\n✓ 100 points = ₱500 discount\n✓ VIP members get 20% off\n✓ Exclusive rates for repeat guests\n✓ Birthday month special offers\n✓ Priority booking & upgrades\n\n🎉 Join FREE today!\nStart earning points now!',
      'How Loyalty Points Work:\n1 night = 100 points earned\n5,000 points = Free 5-night stay\n10,000 points = Premium suite upgrade\n\nPoints never expire!\nRedeem anytime, no blackout dates.',
      'VIP Member Perks:\n👑 20% discount on all stays\n🛏️ Automatic room upgrades\n🍽️ Free meals & drinks\n💆 Complimentary spa services\n🚗 Free airport transfers\n🎉 Exclusive member events'
    ]
  },
  {
    category: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'welcome'],
    responses: [
      'Hello! 👋 Welcome to Skyland Hotel!\n\nI\'m your AI assistant. I can help you with:\n✓ Room bookings & pricing\n✓ Restaurant & food ordering\n✓ Spa & wellness services\n✓ Hotel facilities & amenities\n✓ Special requests & assistance\n✓ Contact information\n\nWhat can I help you with today?',
      'Hi there! 🏨 Welcome to Skyland Hotel Assistant!\n\nI\'m here to answer any questions about:\n🛏️ Accommodations\n🍽️ Dining\n💆 Wellness\n📞 Support\n\nFeel free to ask anything!',
      'Welcome! 😊 Thanks for choosing Skyland Hotel!\n\nI\'m your 24/7 assistant. Ask me about:\n• Room availability & booking\n• Prices & special offers\n• Facilities & services\n• Restaurant menu\n• Travel tips & local info\n\nHow can I serve you today?'
    ]
  },
  {
    category: 'gratitude',
    keywords: ['thank', 'thanks', 'appreciate', 'grateful', 'awesome', 'great', 'love', 'excellent'],
    responses: [
      'You\'re welcome! 😊\n\nI\'m glad I could help! Is there anything else you\'d like to know about Skyland Hotel?\n\nWe\'re always here to make your stay special!',
      'My pleasure! 🙏\n\nThank you for choosing Skyland Hotel. We appreciate your business!\n\nFeel free to ask if you need anything else.',
      'Happy to help! ✨\n\nYour satisfaction is our priority. Enjoy your stay at Skyland Hotel!\n\nLet me know if you have more questions!'
    ]
  },
  {
    category: 'farewell',
    keywords: ['bye', 'goodbye', 'see you', 'exit', 'close', 'that\'s all', 'farewell', 'take care'],
    responses: [
      'Goodbye! 👋\n\nThank you for choosing Skyland Hotel!\nWe look forward to your visit! ✨\n\nSafe travels!',
      'See you soon! 🏨\n\nThank you for chatting with us.\nWe hope to welcome you at Skyland Hotel!\n\nHave a wonderful day!',
      'Take care! 😊\n\nWe appreciate your interest in Skyland Hotel.\nLooking forward to hosting you!\n\nGoodbye! 👋'
    ]
  }
];

// Get random response from category
function getRandomResponse(category) {
  const responses = category.responses || [];
  return responses[Math.floor(Math.random() * responses.length)] || 'How can I help you today?';
}

// Find matching category
function findMatchingCategory(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const category of knowledgeBase) {
    if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }
  
  return null;
}

// POST: Handle chat messages
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
      botReply = '🤔 I\'m not quite sure about that.\n\nHere\'s what I can help with:\n• 🛏️ Room bookings & pricing\n• 🍽️ Restaurant & ordering\n• 💆 Spa & wellness\n• 🏊 Facilities & amenities\n• 📝 Special requests\n• 📞 Contact information\n\nOr reach our team directly:\n📱 +63 2 8000-1234\n📧 reservations@skylandhotel.com';
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

// GET: Chatbot info
router.get('/info', (req, res) => {
  res.json({
    ok: true,
    bot: {
      name: '🤖 Skyland Assistant',
      availability: '24/7',
      languages: ['English', 'Tagalog (coming soon)'],
      capabilities: knowledgeBase.map(kb => kb.category)
    }
  });
});

module.exports = router;
