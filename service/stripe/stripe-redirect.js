import { loadStripe } from "@stripe/stripe-js";

export async function redirectToCheckout(sessionId) {
  const stripe = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    console.error(error);
  }
}
