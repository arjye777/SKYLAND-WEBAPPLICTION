// routes/chatbot.js

const express = require('express');
const router = express.Router();

// Sample rule-based responses
const responses = {
    'hello': 'Hi there! How can I help you today?',
    'booking': 'You can book a room by visiting our website or calling us directly.',
    'hours': 'We are open 24/7. Feel free to reach out at any time.',
    'bye': 'Goodbye! Have a great day!'
};

// Array to hold conversation history
let conversationHistory = [];

// Middleware to log conversation
router.use((req, res, next) => {
    conversationHistory.push(req.body.message);
    next();
});

// Handle chat messages
router.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    let reply;

    // Simple rule-based response
    if(responses[userMessage.toLowerCase()]) {
        reply = responses[userMessage.toLowerCase()];
    } else {
        reply = "I'm sorry, I didn't understand that.";
    }

    // Respond with the reply
    res.json({ reply });
});

// Endpoint to retrieve conversation history
router.get('/history', (req, res) => {
    res.json({ history: conversationHistory });
});

module.exports = router;
