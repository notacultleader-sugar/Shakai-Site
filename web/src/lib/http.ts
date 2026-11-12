// 303 so a form POST lands on a normal page load. Relative paths stay on whatever
// address the site is served from (preview link, workers.dev or the real domain).
export const go = (path: string) => new Response(null, { status: 303, headers: { Location: path } });

// The address the request came in on, for links we hand to Stripe.
export const originOf = (req: Request) => new URL(req.url).origin;

// Only allow redirects back into this site.
export const safeNext = (v: unknown, fallback = "/library") => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
};
