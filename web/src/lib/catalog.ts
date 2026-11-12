import raw from "@/content/catalog.json";
import { type Tier, tierRank } from "./plans";

export type LevelId = "free" | "beginner" | "intermediate" | "advanced" | "bonus";
export type Lesson = { code: string; title: string; module: string; level: LevelId; tier: Tier; index: number };
export type Module = { code: string; title: string; level: LevelId; lessons: Lesson[] };

export const LEVELS: { id: LevelId; name: string; tier: Tier; blurb: string }[] = [
  { id: "free", name: "Free starter", tier: "free", blurb: "Simple first videos. Free with an account." },
  { id: "beginner", name: "Beginner", tier: "beginner", blurb: "The shop, sanitation, every tool, and your first cuts." },
  { id: "intermediate", name: "Intermediate", tier: "intermediate", blurb: "Fades, tapers, scissor work, beards, shaves and real clients." },
  { id: "advanced", name: "Advanced", tier: "pro", blurb: "Precision, designs, color, competition and the business side." },
  { id: "bonus", name: "Bonus series", tier: "pro", blurb: "Watch alongs, quick fixes, gear reviews and shop life." },
];

const levelTier = (l: LevelId) => LEVELS.find((x) => x.id === l)!.tier;

let i = 0;
export const MODULES: Module[] = (raw as { code: string; title: string; level: LevelId; lessons: { code: string; title: string }[] }[]).map((m) => ({
  code: m.code,
  title: m.title,
  level: m.level,
  lessons: m.lessons.map((l) => ({ ...l, module: m.code, level: m.level, tier: levelTier(m.level), index: i++ })),
}));

export const LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);
const byCode = new Map(LESSONS.map((l) => [l.code.toLowerCase(), l]));

export const getLesson = (code: string) => byCode.get(code.toLowerCase());
export const getModule = (code: string) => MODULES.find((m) => m.code === code);
export const modulesIn = (level: LevelId) => MODULES.filter((m) => m.level === level);
export const lessonsIn = (level: LevelId) => LESSONS.filter((l) => l.level === level);
export const canWatch = (viewer: Tier, lesson: Lesson) => tierRank(viewer) >= tierRank(lesson.tier);
export const nextLesson = (l: Lesson) => LESSONS[l.index + 1];
export const prevLesson = (l: Lesson) => (l.index > 0 ? LESSONS[l.index - 1] : undefined);
export const slug = (code: string) => code.toLowerCase();
