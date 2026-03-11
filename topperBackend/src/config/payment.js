const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();

// Replace with your actual credentials or process.env variables
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_PLACEHOLDER',
});

module.exports = instance;
