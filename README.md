# shakaiacademy.com · coming soon page

Static page + one Cloudflare Pages Function, hosted on Cloudflare Pages.

- `index.html` — the page (logo layers in `assets/` are the same cut masks as the app splash).
- `functions/api/subscribe.js` — waitlist signup. Saves each email as a key in the KV namespace bound as `WAITLIST`.
- No build step. Cloudflare Pages settings: framework preset None, build command empty, output directory `/`.

Signups: Cloudflare dashboard → Storage & Databases → KV → the waitlist namespace. Each key is an email.

Local test: `npx wrangler pages dev . --kv WAITLIST`
