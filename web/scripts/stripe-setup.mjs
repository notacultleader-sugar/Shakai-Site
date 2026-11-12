// Creates the three Shakai memberships in Stripe (monthly and yearly prices, CAD)
// and turns on plan switching in the billing portal. Safe to run more than once.
//
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
//
// Run it once with the test key, then once with the live key.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first.");
  process.exit(1);
}
const stripe = new Stripe(key);

const PLANS = [
  { tier: "beginner", name: "Shakai Beginner", month: 1000, year: 10000, description: "Free lessons plus the full Beginner course." },
  { tier: "intermediate", name: "Shakai Intermediate", month: 1500, year: 15000, description: "Beginner plus the full Intermediate course." },
  { tier: "pro", name: "Shakai Pro", month: 2000, year: 20000, description: "The whole academy: Advanced and every bonus series." },
];

const productIds = [];
const pricesByProduct = {};

for (const p of PLANS) {
  const found = await stripe.products.search({ query: `metadata['shakai_tier']:'${p.tier}'` });
  const product =
    found.data[0] ||
    (await stripe.products.create({ name: p.name, description: p.description, metadata: { shakai_tier: p.tier } }));
  productIds.push(product.id);
  pricesByProduct[product.id] = [];

  for (const interval of ["month", "year"]) {
    const lookup_key = `${p.tier}_${interval}`;
    const existing = await stripe.prices.list({ lookup_keys: [lookup_key], active: true, limit: 1 });
    const price =
      existing.data[0] ||
      (await stripe.prices.create({
        product: product.id,
        currency: "cad",
        unit_amount: p[interval],
        recurring: { interval },
        lookup_key,
        metadata: { shakai_tier: p.tier },
      }));
    pricesByProduct[product.id].push(price.id);
    console.log(`${lookup_key}: ${price.id} ($${price.unit_amount / 100} CAD / ${interval})`);
  }
}

// Billing portal: members can switch plans, update cards, see invoices and cancel.
await stripe.billingPortal.configurations.create({
  business_profile: { headline: "Shakai Barber Academy membership" },
  features: {
    customer_update: { enabled: true, allowed_updates: ["email", "address"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end" },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      proration_behavior: "create_prorations",
      products: productIds.map((product) => ({ product, prices: pricesByProduct[product] })),
    },
  },
  default_return_url: (process.env.NEXT_PUBLIC_SITE_URL || "https://shakaiacademy.com") + "/account",
});
console.log("Billing portal set up. Done.");
