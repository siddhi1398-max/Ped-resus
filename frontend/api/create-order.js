module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { uid, email, amount } = req.body;
  if (!uid || !amount) return res.status(400).json({ error: "Missing fields" });

  try {
    // Call Razorpay API directly using fetch — no npm package needed
    const credentials = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        notes: { firebase_uid: uid, email: email || "" },
      }),
    });

    const order = await response.json();
    if (!response.ok) throw new Error(order.error?.description || "Razorpay error");

    res.status(200).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("create-order error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
