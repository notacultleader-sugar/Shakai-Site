import Link from "next/link";
import { type Lesson, canWatch, slug } from "@/lib/catalog";
import type { Tier } from "@/lib/plans";
import { CheckIcon, LockIcon, PlayIcon } from "./icons";

type Props = { lessons: Lesson[]; tier: Tier; signedIn: boolean; done: Set<string>; ready: Set<string>; demo: boolean; current?: string };

export function LessonList({ lessons, tier, signedIn, done, ready, demo, current }: Props) {
  return (
    <ul className="lessons">
      {lessons.map((l) => {
        const open = canWatch({ tier, signedIn }, l);
        const state = !open ? "lock" : done.has(l.code) ? "done" : "open";
        return (
          <li key={l.code} className={l.code === current ? "cur" : undefined}>
            <Link href={`/lesson/${slug(l.code)}`} className={state}>
              <span className="ic">{state === "lock" ? <LockIcon /> : state === "done" ? <CheckIcon /> : <PlayIcon />}</span>
              <span className="lc">{l.code}</span>
              <span className="lt">{l.title}</span>
              {open && !demo && !ready.has(l.code) && <span className="soon">Soon</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
