import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LESSONS, canWatch } from "@/lib/catalog";
import { tierName } from "@/lib/plans";
import { getCompleted, getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Account" };

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }) : null);

export default async function Account({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const v = await getViewer();
  if (!v.signedIn) redirect("/login?next=/account");
  const done = await getCompleted(v);
  const open = LESSONS.filter((l) => canWatch(v.tier, l)).length;
  const date = fmt(v.renewsAt);

  return (
    <div className="wrap">
      <div className="auth" style={{ maxWidth: 560 }}>
        <span className="eyebrow"><i />Account</span>
        <h1 className="h2">Your <em>membership</em></h1>
        {q.change && <p className="okmsg">You already have a membership. Use Manage billing below to switch plans, so you&apos;re never charged twice.</p>}

        <div className="card glow stack">
          <dl className="kv">
            <dt>Email</dt><dd>{v.email}</dd>
            <dt>Plan</dt><dd>{tierName(v.tier)}</dd>
            {v.status && v.status !== "active" && (<><dt>Status</dt><dd>{v.status.replace(/_/g, " ")}</dd></>)}
            {date && (<><dt>{v.cancelAtPeriodEnd ? "Ends" : "Renews"}</dt><dd>{date}</dd></>)}
            <dt>Unlocked</dt><dd>{open} of {LESSONS.length} lessons</dd>
            <dt>Finished</dt><dd>{done.size} lessons</dd>
          </dl>
          <div className="ctas">
            {v.hasBilling && (
              <form action="/api/portal" method="post"><button className="btn ghost sm">Manage billing</button></form>
            )}
            {v.tier !== "pro" && <Link className="btn sm" href="/join">{v.tier === "free" ? "See plans" : "Upgrade"}</Link>}
          </div>
          {v.hasBilling && <p className="small muted">Change plan, update your card, get receipts or cancel in Manage billing.</p>}
        </div>

        <form action="/auth/signout" method="post"><button className="btn ghost sm">Sign out</button></form>
      </div>
    </div>
  );
}
