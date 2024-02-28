export async function stripeCheckout({ lineItems, userEmail }) {
  const stripe = require("stripe")(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: lineItems,
    success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: window.location.origin,
    allow_promotion_codes: true,
  });

  return session.id;
}
