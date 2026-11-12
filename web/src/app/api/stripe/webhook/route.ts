import Stripe from "stripe";
import { parseLookupKey } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

// Stripe tells us when a subscription starts, changes or ends. We copy the tier onto the profile.
// Stripe > Developers > Webhooks > endpoint: https://<site>/api/stripe/webhook
// Events: checkout.session.completed, customer.subscription.created/updated/deleted
const PAID = new Set(["active", "trialing", "past_due"]);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return new Response("not configured", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), sig, secret, undefined, Stripe.createSubtleCryptoProvider());
  } catch {
    return new Response("bad signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.subscription) {
        const sub = await stripe().subscriptions.retrieve(String(session.subscription));
        await sync(sub, session.client_reference_id);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await sync(event.data.object);
      break;
  }
  return Response.json({ received: true });
}

async function sync(sub: Stripe.Subscription, userIdHint?: string | null) {
  const admin = supabaseAdmin();
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const item = sub.items.data[0];
  const plan = parseLookupKey(item?.price.lookup_key);
  const paid = PAID.has(sub.status) && plan;

  const userId = userIdHint || sub.metadata?.supabase_user_id;

  const row = {
    stripe_customer_id: customer,
    stripe_subscription_id: sub.status === "canceled" ? null : sub.id,
    subscription_status: sub.status,
    tier: paid ? plan!.tier : "free",
    current_period_end: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  const q = admin.from("profiles").update(row);
  const { error } = userId ? await q.eq("id", userId) : await q.eq("stripe_customer_id", customer);
  if (error) throw error;
}
