// Which services are connected. With nothing set, the site runs in demo mode.
export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

export const hasSupabase = () => Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isDemo = () => !hasSupabase();
export const hasStripe = () => Boolean(process.env.STRIPE_SECRET_KEY);
export const hasMux = () => Boolean(process.env.MUX_SIGNING_KEY_ID && process.env.MUX_SIGNING_PRIVATE_KEY);
