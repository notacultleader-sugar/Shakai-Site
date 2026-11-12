import type { Metadata } from "next";
import Link from "next/link";
import { Pricing } from "@/components/Pricing";
import { tierName } from "@/lib/plans";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Plans" };

const ERRORS: Record<string, string> = {
  payments: "Payments aren't switched on yet. Check back very soon.",
  price: "That plan isn't available right now. Please try another or contact us.",
};

export default async function Join({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const v = await getViewer();
  const paying = v.tier !== "free" && v.hasBilling;
  return (
    <div className="wrap">
      <div className="lib-head">
        <span className="eyebrow"><i />Membership</span>
        <h1 className="display">Pick your <em>level.</em></h1>
        <p className="lede">
          {v.tier === "free"
            ? "Every plan includes the levels below it. Prices in Canadian dollars. Cancel any time."
            : `You're on ${tierName(v.tier)}. Moving up unlocks the next level straight away.`}
        </p>
        {q.error && ERRORS[q.error] && <p className="err">{ERRORS[q.error]}</p>}
      </div>
      <Pricing
        viewerTier={v.tier}
        paying={paying}
        initialInterval={q.interval === "year" ? "year" : "month"}
        highlight={q.plan || "intermediate"}
      />
      {!v.signedIn && (
        <p className="muted small" style={{ marginTop: 18 }}>
          Just want a look first? <Link className="link" href="/login?next=/library">Make a free account</Link> and watch the starter lessons.
        </p>
      )}
    </div>
  );
}
