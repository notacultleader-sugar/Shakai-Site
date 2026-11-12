# Shakai Academy members site

The full shakaiacademy.com site: free accounts, three paid memberships, and a lesson
library that unlocks the right videos for each plan. Lives in `web/` so the live coming
soon page at the repo root keeps running until launch.

- **Next.js** app, deployed to **Cloudflare Workers** (via OpenNext)
- **Supabase** for sign in (6 digit email code, no passwords) and the member database
- **Stripe** for memberships, in Canadian dollars
- **Mux** for video, with signed playback so links can't be shared

## Plans

| Plan | Monthly | Yearly | Unlocks |
| --- | --- | --- | --- |
| Free | $0 | $0 | Free starter lessons (needs an account) |
| Beginner | $10 | $100 | Free + Beginner |
| Intermediate | $15 | $150 | Free + Beginner + Intermediate |
| Pro | $20 | $200 | Everything, including Advanced and bonus series |

Prices and wording: `src/lib/plans.ts`.

**Founding members:** the first 500 paying members keep their price for as long as they
stay subscribed (`FOUNDING_LIMIT` in `src/lib/plans.ts`). The plans page shows how many
spots are left and hides the banner once they're gone. To raise prices later, create new
Stripe prices and move the lookup key to them (`transfer_lookup_key`). Existing
subscriptions stay on their old price automatically. Stripe prices: `scripts/stripe-setup.mjs`.

## Lessons

Every lesson (code, title, module, level) is in `src/content/catalog.json`, copied from the
"Shakai Lesson Video List" doc. The level decides the plan: F = Free, B = Beginner,
I = Intermediate, A and X = Pro. The six F1 starter lessons are placeholders to confirm.

To put a video on a lesson: upload it to Mux with the **signed** playback policy, then in
Supabase > Table editor > `videos` add a row with the lesson code (like `B5.1`) and the
Mux playback ID. Lessons without a video show "Video coming soon".

## Demo mode

With no keys set, the site runs in demo mode: sample sign in, a bar at the bottom to
preview as a guest or any plan, and no payments. Handy for checking layouts.

```
npm install
npm run dev        # http://localhost:3000
```

## Going live (one time)

1. **Supabase**: make a project. SQL Editor > paste `supabase/schema.sql` > Run.
   Authentication > Email templates > "Magic link": add `{{ .Token }}` so the email shows
   the 6 digit code. Authentication > URL configuration: set Site URL to the live address.
2. **Stripe**: run `STRIPE_SECRET_KEY=... node scripts/stripe-setup.mjs` (test key first).
   Developers > Webhooks > add `https://<site>/api/stripe/webhook` with events
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
3. **Mux**: Settings > Signing keys > generate. Keep the key ID and the private key.
4. **Cloudflare**: Workers & Pages > Create > Import the GitHub repo, root directory `web`,
   build command `npx opennextjs-cloudflare build`, deploy command
   `npx opennextjs-cloudflare deploy`. Add every variable from `.env.example`
   (the `NEXT_PUBLIC_` ones as build variables too).
5. At launch, point shakaiacademy.com at the new Worker instead of the coming soon page.
