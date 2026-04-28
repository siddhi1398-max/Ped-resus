// netlify/functions/create-order.js
// Creates a Razorpay order server-side.
// The order_id is required for signature-based payment verification.

const Razorpay = require("razorpay");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { uid, email, amount } = JSON.parse(event.body);

    if (!uid || !amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing uid or amount" }),
      };
    }

    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount:   amount, // in paise
      currency: "INR",
      notes:    { firebase_uid: uid, email: email || "" },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
      }),
    };

  } catch (err) {
    console.error("create-order error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create order" }),
    };
  }
};
