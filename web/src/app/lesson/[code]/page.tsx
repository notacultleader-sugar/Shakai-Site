import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonList } from "@/components/LessonList";
import { LockIcon, PlayIcon } from "@/components/icons";
import { LEVELS, canWatch, getLesson, getModule, lessonDetails, nextLesson, prevLesson, slug } from "@/lib/catalog";
import { muxTokens } from "@/lib/mux";
import { planFor } from "@/lib/plans";
import { getCompleted, getVideos, getViewer } from "@/lib/viewer";
import { Chapters } from "./Chapters";
import { DoneButton } from "./DoneButton";
import { Player } from "./Player";

type Params = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const l = getLesson((await params).code);
  return l ? { title: `${l.code} ${l.title}`, description: lessonDetails(l).description } : {};
}

export default async function LessonPage({ params }: Params) {
  const lesson = getLesson((await params).code);
  if (!lesson) notFound();
  const mod = getModule(lesson.module)!;
  const level = LEVELS.find((x) => x.id === lesson.level)!;
  const info = lessonDetails(lesson);
  const v = await getViewer();
  const open = canWatch(v.tier, lesson);
  const done = await getCompleted(v);
  const videos = await getVideos(open ? mod.lessons.filter((l) => canWatch(v.tier, l)).map((l) => l.code) : []);
  const video = videos.get(lesson.code);
  const tokens = open && video ? await muxTokens(video.playbackId) : null;
  const playable = Boolean(open && video && tokens);
  const prev = prevLesson(lesson);
  const next = nextLesson(lesson);
  const needs = planFor(lesson.tier);
  const minutes = video?.seconds ? Math.round(video.seconds / 60) : info.minutes;
  const position = mod.lessons.indexOf(lesson) + 1;

  return (
    <div className="wrap wide">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/library">Lessons</Link><span>/</span>
        <Link href={`/library#${level.id}`}>{level.name}</Link><span>/</span>
        <span>{mod.code} {mod.title}</span>
      </nav>

      <div className="watch">
        {/* Video */}
        <div className="watch-video">
          <div className="screen">
            {playable ? (
              <Player playbackId={video!.playbackId} tokens={tokens!} title={`${lesson.code} ${lesson.title}`} />
            ) : open ? (
              <div className="over poster">
                <span className="poster-kanji" aria-hidden="true">社会</span>
                <span className="poster-code">{lesson.code}</span>
                <span className="play-big" aria-hidden="true"><PlayIcon /></span>
                <p className="big">{lesson.title}</p>
                <p className="small muted">{v.demo ? "Sample page. The lesson video plays here once it's uploaded." : "We're filming this one now. It will play here as soon as it's ready."}</p>
                {minutes && <span className="poster-time">{minutes}:00</span>}
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

          <div className="pager">
            {prev && (
              <Link href={`/lesson/${slug(prev.code)}`}>
                <small>Previous</small><span>{prev.code} {prev.title}</span>
              </Link>
            )}
            {next && (
              <Link href={`/lesson/${slug(next.code)}`} className="nx">
                <small>Up next</small><span>{next.code} {next.title}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Details, beside the video on a computer and under it on a phone */}
        <aside className="watch-info card">
          <div className="tags">
            <span className="pill y">{lesson.code}</span>
            <span className="pill">{level.name}</span>
            {minutes && <span className="pill">{minutes} min</span>}
            {done.has(lesson.code) && <span className="pill ok">Done</span>}
          </div>
          <h1 className="h2 watch-title">{lesson.title}</h1>
          <p className="watch-desc">{info.description}</p>
          {open && v.signedIn && (
            <div className="watch-actions">
              <DoneButton code={lesson.code} initial={done.has(lesson.code)} />
            </div>
          )}

          {info.learn.length > 0 && (
            <section>
              <h2 className="label">What you&apos;ll learn</h2>
              <ul className="ticks">{info.learn.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          )}

          {info.tools.length > 0 && (
            <section>
              <h2 className="label">Tools you&apos;ll need</h2>
              <ul className="chips">{info.tools.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          )}

          {info.chapters.length > 0 && (
            <section>
              <h2 className="label">Chapters</h2>
              <Chapters chapters={info.chapters} playable={playable} />
            </section>
          )}
        </aside>

        {/* Rest of the module, like a playlist */}
        <div className="watch-list module">
          <div className="playlist-head">
            <span className="h3" style={{ color: "var(--y)", fontSize: 15 }}>{mod.code}</span>
            <span style={{ fontWeight: 600, flex: 1 }}>{mod.title}</span>
            <span className="small muted">{position} / {mod.lessons.length}</span>
          </div>
          <LessonList lessons={mod.lessons} tier={v.tier} done={done} ready={new Set(videos.keys())} demo={v.demo} current={lesson.code} />
        </div>
      </div>
    </div>
  );
}
