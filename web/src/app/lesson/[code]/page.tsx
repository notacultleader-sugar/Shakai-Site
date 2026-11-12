import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonList } from "@/components/LessonList";
import { LockIcon } from "@/components/icons";
import { LEVELS, canWatch, getLesson, getModule, nextLesson, prevLesson, slug } from "@/lib/catalog";
import { muxTokens } from "@/lib/mux";
import { planFor } from "@/lib/plans";
import { getCompleted, getVideos, getViewer } from "@/lib/viewer";
import { DoneButton } from "./DoneButton";
import { Player } from "./Player";

type Params = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const l = getLesson((await params).code);
  return l ? { title: `${l.code} ${l.title}` } : {};
}

export default async function LessonPage({ params }: Params) {
  const lesson = getLesson((await params).code);
  if (!lesson) notFound();
  const mod = getModule(lesson.module)!;
  const level = LEVELS.find((x) => x.id === lesson.level)!;
  const v = await getViewer();
  const open = canWatch(v.tier, lesson);
  const done = await getCompleted(v);
  const videos = await getVideos(open ? mod.lessons.filter((l) => canWatch(v.tier, l)).map((l) => l.code) : []);
  const video = videos.get(lesson.code);
  const tokens = open && video ? await muxTokens(video.playbackId) : null;
  const prev = prevLesson(lesson);
  const next = nextLesson(lesson);
  const needs = planFor(lesson.tier);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/library">Lessons</Link><span>/</span>
        <Link href={`/library#${level.id}`}>{level.name}</Link><span>/</span>
        <span>{mod.code} {mod.title}</span>
      </nav>

      <div className="lesson-grid">
        <div>
          <div className="screen">
            {open && video && tokens ? (
              <Player playbackId={video.playbackId} tokens={tokens} title={`${lesson.code} ${lesson.title}`} />
            ) : open ? (
              <div className="over">
                <span className="pill y">{v.demo ? "Demo" : "Coming soon"}</span>
                <p className="big">{v.demo ? "Video plays here" : "Video coming soon"}</p>
                <p className="small muted">{v.demo ? "Once a video is uploaded for this lesson, it plays right here." : "We're filming this one now. You'll find it here as soon as it's ready."}</p>
              </div>
            ) : (
              <div className="over">
                <span className="lockic"><LockIcon /></span>
                <p className="big">{lesson.tier === "free" ? "Free with an account" : `Part of ${needs!.name}`}</p>
                {!v.signedIn && lesson.tier === "free" ? (
                  <Link className="btn sm" href={`/login?next=/lesson/${slug(lesson.code)}`}>Start free</Link>
                ) : (
                  <>
                    <p className="small muted">Unlock {level.name} and everything below it for ${needs!.monthly} a month.</p>
                    <Link className="btn pink sm" href={`/join?plan=${lesson.tier}`}>Get {needs!.name}</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="lesson-meta">
            <span className="eyebrow"><i />{lesson.code} · {level.name}</span>
            <h1 className="h2">{lesson.title}</h1>
            <div className="lesson-actions">
              <span className="small muted">{mod.title}</span>
              {open && v.signedIn && <DoneButton code={lesson.code} initial={done.has(lesson.code)} />}
            </div>
          </div>

          <div className="pager">
            {prev && (
              <Link href={`/lesson/${slug(prev.code)}`}>
                <small>Previous</small><span>{prev.code} {prev.title}</span>
              </Link>
            )}
            {next && (
              <Link href={`/lesson/${slug(next.code)}`} className="nx">
                <small>Next</small><span>{next.code} {next.title}</span>
              </Link>
            )}
          </div>
        </div>

        <aside className="side">
          <div className="module">
            <div style={{ padding: "14px 16px", display: "flex", gap: 10, alignItems: "baseline" }}>
              <span className="h3" style={{ color: "var(--y)", fontSize: 15 }}>{mod.code}</span>
              <span style={{ fontWeight: 600 }}>{mod.title}</span>
            </div>
            <LessonList lessons={mod.lessons} tier={v.tier} done={done} ready={new Set(videos.keys())} demo={v.demo} current={lesson.code} />
          </div>
        </aside>
      </div>
    </div>
  );
}
