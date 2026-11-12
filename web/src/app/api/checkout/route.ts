import { cookies } from "next/headers";
import { hasStripe, isDemo } from "@/lib/config";
import { go } from "@/lib/http";
import { type Interval, type PaidTier, lookupKey } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";
import { DEMO_COOKIE, getViewer } from "@/lib/viewer";
import { env } from "@/lib/config";

// POST from the pricing page: tier + interval. Sends the member to Stripe Checkout.
export async function POST(req: Request) {
  const form = await req.formData();
  const tier = String(form.get("tier")) as PaidTier;
  const interval = (String(form.get("interval")) === "year" ? "year" : "month") as Interval;
  if (!["beginner", "intermediate", "pro"].includes(tier)) return go("/join");

  const viewer = await getViewer();
  if (!viewer.signedIn) return go(`/login?next=${encodeURIComponent(`/join?plan=${tier}&interval=${interval}`)}`);

  // Demo: pretend the payment went through.
  if (isDemo()) {
    (await cookies()).set(DEMO_COOKIE, tier, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return go("/library?welcome=1");
  }
  if (!hasStripe()) return go("/join?error=payments");

  const s = stripe();
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id, subscription_status")
    .eq("id", viewer.userId!)
    .single();

  // Already paying? Change plans in the billing portal so nobody gets charged twice.
  if (profile?.stripe_subscription_id && ["active", "trialing", "past_due"].includes(profile.subscription_status ?? "")) {
    return go("/account?change=1");
  }

  let customer = profile?.stripe_customer_id as string | undefined;
  if (!customer) {
    const c = await s.customers.create({ email: viewer.email, metadata: { supabase_user_id: viewer.userId! } });
    customer = c.id;
    await admin.from("profiles").update({ stripe_customer_id: customer }).eq("id", viewer.userId!);
  }

  const prices = await s.prices.list({ lookup_keys: [lookupKey(tier, interval)], active: true, limit: 1 });
  const price = prices.data[0];
  if (!price) return go("/join?error=price");

  const session = await s.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: viewer.userId,
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { metadata: { supabase_user_id: viewer.userId! } },
    success_url: `${env.siteUrl}/library?welcome=1`,
    cancel_url: `${env.siteUrl}/join`,
  });
  return go(session.url!);
}
