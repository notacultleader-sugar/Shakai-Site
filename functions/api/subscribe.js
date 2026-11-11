// POST /api/subscribe  { email, company (honeypot), ref }
// Saves each signup to the Cloudflare KV namespace bound as WAITLIST.
// Key = lowercased email, value = JSON with signup time, country and referrer.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ error: "bad_request" }, 400); }

  // Bots fill the hidden field; pretend it worked.
  if (data.company) return json({ ok: true });

  const email = String(data.email || "").trim().toLowerCase().slice(0, 254);
  if (!EMAIL.test(email)) return json({ error: "invalid_email" }, 400);

  if (!env.WAITLIST) return json({ error: "not_configured" }, 503);

  const existing = await env.WAITLIST.get(email);
  if (!existing) {
    await env.WAITLIST.put(email, JSON.stringify({
      signedUpAt: new Date().toISOString(),
      country: request.cf?.country || null,
      city: request.cf?.city || null,
      ref: String(data.ref || "").slice(0, 300),
    }));
  }
  return json({ ok: true });
}

export const onRequest = () => json({ error: "method_not_allowed" }, 405);
