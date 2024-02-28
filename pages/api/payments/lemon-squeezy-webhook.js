export const config = {
  api: {
    bodyParser: false,
  },
};

export const maxDuration = 300;

import getRawBody from "raw-body";

const relevantEvents = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

export default async function handler(req, res) {
  const crypto = require("crypto");

  const rawBody = await getRawBody(req);

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex"); // Get the digest as a hex string

  const signature = req.headers["x-signature"];

  if (digest !== signature) {
    throw new Error("Invalid signature.");
  }

  const data = JSON.parse(rawBody);

  const eventType = data["meta"]["event_name"];
  console.log(eventType);

  if (relevantEvents.has(eventType)) {
    const susbcription = data["data"];

    const subscriptionStatus = susbcription["attributes"]["status"];
    const subscriptionId = susbcription["id"];
    const userEmail = susbcription["attributes"]["user_email"];

    //do something with values from event based on your need
  }

  return res.send({
    status: true,
    msg: "success",
  });
}
