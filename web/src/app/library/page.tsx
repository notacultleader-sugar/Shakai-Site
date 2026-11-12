import type { Metadata } from "next";
import Link from "next/link";
import { LessonList } from "@/components/LessonList";
import { LockIcon } from "@/components/icons";
import { LESSONS, LEVELS, canWatch, lessonsIn, modulesIn } from "@/lib/catalog";
import { planFor, tierName, tierRank } from "@/lib/plans";
import { getCompleted, getVideos, getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Lessons" };

export default async function Library({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const v = await getViewer();
  const done = await getCompleted(v);
  const videos = await getVideos(LESSONS.filter((l) => canWatch(v.tier, l)).map((l) => l.code));
  const ready = new Set(videos.keys());
  const firstOpen = LESSONS.find((l) => canWatch(v.tier, l) && !done.has(l.code));

  return (
    <div className="wrap">
      <div className="lib-head">
        {q.welcome && (
          <div className="card glow banner">
            <div>
              <h2 className="h3">Welcome to {tierName(v.tier)}</h2>
              <p className="muted small">Your lessons are unlocked. Start wherever you like, or pick up from the top.</p>
            </div>
          </div>
        )}
        <span className="eyebrow"><i />{v.signedIn ? `${tierName(v.tier)} member` : "The full library"}</span>
        <h1 className="display">All <em>lessons</em></h1>
        <p className="lede">
          {v.signedIn
            ? `${LESSONS.filter((l) => canWatch(v.tier, l)).length} of ${LESSONS.length} lessons unlocked on your plan. You've finished ${done.size}.`
            : "Browse everything. Make a free account to watch the starter lessons, or join a plan to unlock a full course."}
        </p>
        <div className="ctas">
          {firstOpen && v.signedIn && <Link className="btn" href={`/lesson/${firstOpen.code.toLowerCase()}`}>{done.size ? "Keep going" : "Start lesson 1"}</Link>}
          {!v.signedIn && <Link className="btn" href="/login?next=/library">Start free</Link>}
          {v.tier !== "pro" && <Link className="btn ghost" href="/join">{v.signedIn ? "Unlock more" : "See plans"}</Link>}
        </div>
      </div>

      <nav className="level-nav" aria-label="Levels">
        {LEVELS.map((l) => (
          <a key={l.id} href={`#${l.id}`}>
            {tierRank(v.tier) < tierRank(l.tier) && <LockIcon />}
            {l.name}
          </a>
        ))}
      </nav>

      {LEVELS.map((l) => {
        const lessons = lessonsIn(l.id);
        const unlocked = tierRank(v.tier) >= tierRank(l.tier);
        const finished = lessons.filter((x) => done.has(x.code)).length;
        const needs = planFor(l.tier);
        return (
          <section key={l.id} id={l.id} className="level">
            <div className="level-top">
              <div className="left">
                <h2 className="h2">{l.name}</h2>
                <p className="muted small">{l.blurb} {lessons.length} videos.</p>
              </div>
              {unlocked ? (
                v.signedIn ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="bar" aria-hidden="true"><i style={{ width: `${(finished / lessons.length) * 100}%` }} /></div>
                    <span className="small muted">{finished}/{lessons.length}</span>
                  </div>
                ) : (
                  <span className="pill y">Free</span>
                )
              ) : (
                <span className="pill p"><LockIcon /> {needs?.name}</span>
              )}
            </div>
            {!unlocked && (
              <div className="locked-note">
                <span className="small">
                  {l.tier === "free"
                    ? "Make a free account to watch these."
                    : `Unlocks with ${needs!.name}, $${needs!.monthly} a month.`}
                </span>
                <Link className="btn pink sm" href={l.tier === "free" ? "/login?next=/library" : `/join?plan=${l.tier}`}>
                  {l.tier === "free" ? "Start free" : `Get ${needs!.name}`}
                </Link>
              </div>
            )}
            <div className="modules">
              {modulesIn(l.id).map((m, i) => (
                <details key={m.code} className="module" open={unlocked && i === 0}>
                  <summary>
                    <span className="code">{m.code}</span>
                    <span className="t">{m.title}</span>
                    <span className="n">{m.lessons.length}</span>
                  </summary>
                  <LessonList lessons={m.lessons} tier={v.tier} done={done} ready={ready} demo={v.demo} />
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
