import { hasStripe } from "@/lib/config";
import { go, originOf } from "@/lib/http";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

// Stripe's billing portal: change plan, update card, cancel, download receipts.
export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer.signedIn) return go("/login?next=/account");
  if (viewer.demo || !hasStripe()) return go("/account");

  const { data } = await supabaseAdmin().from("profiles").select("stripe_customer_id").eq("id", viewer.userId!).single();
  if (!data?.stripe_customer_id) return go("/join");

  const session = await stripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${originOf(req)}/account`,
  });
  return go(session.url);
}
