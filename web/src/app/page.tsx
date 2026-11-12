import Link from "next/link";
import { FoundingBanner } from "@/components/FoundingBanner";
import { Pricing } from "@/components/Pricing";
import { LESSONS, LEVELS, lessonsIn, modulesIn } from "@/lib/catalog";
import { tierName } from "@/lib/plans";
import { getViewer } from "@/lib/viewer";

const FAQ: [string, string][] = [
  ["What is the founding member price?", "The first 500 people to join a paid plan keep the price they joined at for as long as they stay a member. When prices go up for new members, yours stays the same."],
  ["Do higher plans include the lower ones?", "Yes. Intermediate includes everything in Beginner, and Pro includes the whole academy, bonus series and all."],
  ["What can I watch for free?", "Make a free account and you get the starter lessons, made for people who have never picked up clippers. No card needed."],
  ["Can I cancel or switch plans?", "Any time, from your account page. If you cancel, you keep access until the end of the period you paid for."],
  ["Do I need to be a barber already?", "No. Beginner starts with the shop, sanitation and how to hold your tools. Working barbers usually jump into Intermediate or Pro."],
  ["Can I watch on my phone?", "Yes. Every lesson plays on your phone, tablet or computer."],
];

export default async function Home() {
  const v = await getViewer();
  const paid = LESSONS.filter((l) => l.tier !== "free").length;
  return (
    <>
      <div className="wrap">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><i />Shakai Barber Academy</span>
            <h1 className="display">Barbering lessons, <em>step by step.</em></h1>
            <p className="lede">
              Fades, tapers, beards, shaves and the business side, taught by the barbers behind <strong>Society Barbers</strong>.
              Short videos, one skill at a time, from your first clipper to advanced work.
            </p>
            <div className="ctas">
              {v.signedIn ? (
                <Link className="btn" href="/library">Go to lessons</Link>
              ) : (
                <Link className="btn" href="/login?next=/library">Start free</Link>
              )}
              <Link className="btn ghost" href="#plans">See plans</Link>
            </div>
          </div>
          <div className="hero-logo" role="img" aria-label="社会 Shakai Barber Academy, by Society Barbers">
            <i className="f" /><i className="k" /><i className="w" /><i className="a" /><i className="d" /><i className="s" />
          </div>
        </section>

        <div className="stats">
          <div className="stat"><b>{paid}+</b><span>video lessons</span></div>
          <div className="stat"><b>4</b><span>levels plus bonus series</span></div>
          <div className="stat"><b>$0</b><span>to start learning</span></div>
        </div>

        <section className="section">
          <div className="section-head">
            <span className="eyebrow"><i />What&apos;s inside</span>
            <h2 className="h2">From the first clipper <em>to the top chair.</em></h2>
          </div>
          <div className="levels">
            {LEVELS.map((l) => (
              <Link key={l.id} href={`/library#${l.id}`} className="card level-card">
                <div className="row">
                  <h3 className="h3">{l.name}</h3>
                  <span className={`pill${l.tier === "free" ? " y" : ""}`}>{l.tier === "free" ? "Free" : tierName(l.tier)}</span>
                </div>
                <p className="muted">{l.blurb}</p>
                <span className="small" style={{ color: "var(--dim)" }}>{lessonsIn(l.id).length} videos · {modulesIn(l.id).length} modules</span>
                <ul>{modulesIn(l.id).slice(0, 5).map((m) => <li key={m.code}>{m.title}</li>)}</ul>
              </Link>
            ))}
          </div>
        </section>

        <section className="section" id="plans">
          <div className="section-head">
            <span className="eyebrow"><i />Membership</span>
            <h2 className="h2">Pick your level. <em>Move up any time.</em></h2>
            <p className="lede">Every plan includes the levels below it. Prices in Canadian dollars. Cancel whenever you like.</p>
          </div>
          {v.tier === "free" && <FoundingBanner />}
          <Pricing viewerTier={v.tier} paying={v.tier !== "free" && v.hasBilling} />
          {!v.signedIn && (
            <div className="card free-strip">
              <div>
                <h3 className="h3">Not ready to pay?</h3>
                <p className="muted small">Make a free account and watch the starter lessons. No card needed.</p>
              </div>
              <Link className="btn ghost" href="/login?next=/library">Start free</Link>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <span className="eyebrow"><i />Questions</span>
            <h2 className="h2">Good to know</h2>
          </div>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
