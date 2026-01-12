const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function testWebhook() {
  console.log("🧪 Testing Stripe Webhook...\n");

  try {
    // 1. Create a test payment intent
    console.log("1️⃣ Creating test payment intent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100000, // 100,000 VND
      currency: "vnd",
      payment_method_types: ["card"],
      metadata: {
        test: "true",
        orderId: "test-order-123",
      },
    });
    console.log("✅ Payment Intent created:", paymentIntent.id);
    console.log(
      "   Amount:",
      paymentIntent.amount,
      paymentIntent.currency.toUpperCase()
    );

    // 2. Simulate payment success
    console.log("\n2️⃣ Simulating payment success...");
    console.log("   Run this command in another terminal:");
    console.log(
      `   stripe trigger payment_intent.succeeded --override payment_intent:id=${paymentIntent.id}`
    );

    console.log("\n📝 Note: Make sure you have Stripe CLI running:");
    console.log(
      "   stripe listen --forward-to localhost:3000/api/stripe/webhooks"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the test
testWebhook();
