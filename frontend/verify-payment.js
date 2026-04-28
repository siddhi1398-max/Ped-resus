// netlify/functions/verify-payment.js
// ─────────────────────────────────────────────────────────────────────────────
// This serverless function runs on Netlify/Vercel backend.
// Razorpay calls this webhook URL after every payment.
// It verifies the payment signature, then writes to Firebase Firestore.
// This is the SECURE way — no client can fake a payment.
// ─────────────────────────────────────────────────────────────────────────────

const crypto = require("crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// ── Initialize Firebase Admin (only once) ────────────────────────────────────
function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:    process.env.FIREBASE_PROJECT_ID,
        clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \n in env var (Netlify strips them)
        privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

// ── Verify Razorpay signature ─────────────────────────────────────────────────
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const body      = orderId + "|" + paymentId;
  const expected  = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

// ── Main handler ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      firebase_uid,
      email,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !firebase_uid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Verify signature — prevents fake payment claims
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error("Invalid Razorpay signature for UID:", firebase_uid);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid payment signature" }),
      };
    }

    // Signature valid — write to Firestore
    const db = getDb();
    await db.collection("paid_users").doc(firebase_uid).set({
      paid:       true,
      email:      email || "",
      paymentId:  razorpay_payment_id,
      orderId:    razorpay_order_id,
      paidAt:     new Date().toISOString(),
      verifiedBy: "razorpay-webhook",
    });

    console.log("Payment verified and saved for UID:", firebase_uid);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: "Payment verified" }),
    };

  } catch (err) {
    console.error("verify-payment error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
