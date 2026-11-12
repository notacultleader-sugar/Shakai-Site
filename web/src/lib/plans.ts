// Membership tiers. Each tier includes everything in the tiers below it.
export const TIERS = ["free", "beginner", "intermediate", "pro"] as const;
export type Tier = (typeof TIERS)[number];
export type PaidTier = Exclude<Tier, "free">;
export type Interval = "month" | "year";

export const tierRank = (t: Tier) => TIERS.indexOf(t);
export const isTier = (v: unknown): v is Tier => TIERS.includes(v as Tier);

export type Plan = {
  tier: PaidTier;
  name: string;
  monthly: number; // CAD
  yearly: number; // CAD
  blurb: string;
  includes: string[];
};

export const CURRENCY = "CAD";

export const PLANS: Plan[] = [
  {
    tier: "beginner",
    name: "Beginner",
    monthly: 10,
    yearly: 100,
    blurb: "Everything you need before and around your first haircuts.",
    includes: ["All free lessons", "Full Beginner course", "Track your progress"],
  },
  {
    tier: "intermediate",
    name: "Intermediate",
    monthly: 15,
    yearly: 150,
    blurb: "Fades, tapers, beards, shaves and real client work.",
    includes: ["Everything in Beginner", "Full Intermediate course", "Popular cuts start to finish"],
  },
  {
    tier: "pro",
    name: "Pro",
    monthly: 20,
    yearly: 200,
    blurb: "The whole academy, including advanced work and every bonus series.",
    includes: ["Everything in Intermediate", "Full Advanced course", "All bonus series", "New videos as they land"],
  },
];

export const planFor = (t: Tier) => PLANS.find((p) => p.tier === t);
export const tierName = (t: Tier) => (t === "free" ? "Free" : planFor(t)!.name);

// Stripe price lookup keys, e.g. "beginner_month". The setup script creates these.
export const lookupKey = (tier: PaidTier, interval: Interval) => `${tier}_${interval}`;
export const parseLookupKey = (key: string | null | undefined): { tier: PaidTier; interval: Interval } | null => {
  const [tier, interval] = String(key || "").split("_");
  if (!["beginner", "intermediate", "pro"].includes(tier)) return null;
  if (interval !== "month" && interval !== "year") return null;
  return { tier: tier as PaidTier, interval };
};

// Founding members: the first FOUNDING_LIMIT paying members keep today's prices for as
// long as they stay subscribed. Stripe does this on its own: raising prices later means
// making new prices, and existing subscriptions stay on the old ones.
export const FOUNDING_LIMIT = 500;
