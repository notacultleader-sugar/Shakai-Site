"use client";
import Link from "next/link";
import { useState } from "react";
import { type Interval, type Tier, PLANS, tierRank } from "@/lib/plans";

type Props = { viewerTier: Tier; paying: boolean; initialInterval?: Interval; highlight?: string };

export function Pricing({ viewerTier, paying, initialInterval = "month", highlight = "intermediate" }: Props) {
  const [interval, setInterval] = useState<Interval>(initialInterval);
  return (
    <div>
      <div className="toggle" role="group" aria-label="Billing period">
        <button type="button" aria-pressed={interval === "month"} onClick={() => setInterval("month")}>Monthly</button>
        <button type="button" aria-pressed={interval === "year"} onClick={() => setInterval("year")}>
          Yearly<small>2 months free</small>
        </button>
      </div>
      <div className="plans">
        {PLANS.map((p) => {
          const current = viewerTier === p.tier;
          const below = tierRank(p.tier) < tierRank(viewerTier);
          const price = interval === "month" ? p.monthly : p.yearly;
          return (
            <div key={p.tier} className={`card plan${p.tier === highlight ? " featured" : ""}`} id={`plan-${p.tier}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <h3 className="h3">{p.name}</h3>
                {current ? <span className="pill ok">Your plan</span> : p.tier === "intermediate" ? <span className="pill p">Most popular</span> : null}
              </div>
              <div className="price">
                <b>${price}</b>
                <span>CAD / {interval === "month" ? "month" : "year"}</span>
              </div>
              <p className="muted small">{interval === "year" ? `Works out to $${(p.yearly / 12).toFixed(2)} a month.` : p.blurb}</p>
              <ul>{p.includes.map((x) => <li key={x}>{x}</li>)}</ul>
              {current ? (
                <Link className="btn ghost block" href="/library">Go to lessons</Link>
              ) : paying ? (
                <form action="/api/portal" method="post">
                  <button className="btn ghost block">{below ? "Switch to this plan" : `Upgrade to ${p.name}`}</button>
                </form>
              ) : (
                <form action="/api/checkout" method="post">
                  <input type="hidden" name="tier" value={p.tier} />
                  <input type="hidden" name="interval" value={interval} />
                  <button className={`btn block${p.tier === highlight ? " pink" : ""}`}>Get {p.name}</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
