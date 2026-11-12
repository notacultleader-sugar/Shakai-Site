import { NextResponse } from "next/server";
import { env } from "./config";

// 303 so a form POST lands on a normal page load.
export const go = (path: string) => NextResponse.redirect(new URL(path, env.siteUrl), 303);

// Only allow redirects back into this site.
export const safeNext = (v: unknown, fallback = "/library") => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
};
