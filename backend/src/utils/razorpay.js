import Razorpay from "razorpay";

// Read Razorpay credentials from .env
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

// Check credentials
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay API credentials are missing");
}

// Ensure we use Test Mode during development
if (!RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
  throw new Error("Please use Razorpay Test Mode credentials");
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export default razorpay;