import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isDemo } from "./config";
import { FOUNDING_LIMIT, type Tier, isTier } from "./plans";
import { supabaseServer } from "./supabase/server";

export type Viewer = {
  signedIn: boolean;
  userId?: string;
  email?: string;
  tier: Tier;
  status?: string | null; // Stripe subscription status
  renewsAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  hasBilling: boolean;
  demo: boolean;
};

export const DEMO_COOKIE = "shakai_demo";

// Who is looking at the page, and what they can watch.
export const getViewer = cache(async (): Promise<Viewer> => {
  if (isDemo()) {
    const v = (await cookies()).get(DEMO_COOKIE)?.value;
    if (!v) return { signedIn: false, tier: "free", hasBilling: false, demo: true };
    return { signedIn: true, email: "demo@shakaiacademy.com", tier: isTier(v) ? v : "free", hasBilling: false, demo: true };
  }

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return { signedIn: false, tier: "free", hasBilling: false, demo: false };

  const { data: p } = await sb
    .from("profiles")
    .select("tier, subscription_status, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    signedIn: true,
    userId: data.user.id,
    email: data.user.email,
    tier: isTier(p?.tier) ? p!.tier : "free",
    status: p?.subscription_status ?? null,
    renewsAt: p?.current_period_end ?? null,
    cancelAtPeriodEnd: Boolean(p?.cancel_at_period_end),
    hasBilling: Boolean(p?.stripe_customer_id),
    demo: false,
  };
});

// Lessons this member has marked done.
export async function getCompleted(viewer: Viewer): Promise<Set<string>> {
  if (viewer.demo || !viewer.userId) return new Set();
  const sb = await supabaseServer();
  const { data } = await sb.from("progress").select("lesson_code").eq("user_id", viewer.userId);
  return new Set((data || []).map((r) => r.lesson_code as string));
}

export type Angle = { label: string; playbackId: string };
export type LessonVideo = { angles: Angle[]; seconds: number | null };

// Mux playback IDs for lessons that have a video uploaded, one per camera angle.
export async function getVideos(codes: string[]): Promise<Map<string, LessonVideo>> {
  if (isDemo() || codes.length === 0) return new Map();
  const sb = await supabaseServer();
  const { data } = await sb
    .from("videos")
    .select("lesson_code, angle, sort, mux_playback_id, duration_seconds")
    .in("lesson_code", codes)
    .order("sort")
    .order("angle");
  const out = new Map<string, LessonVideo>();
  for (const r of data || []) {
    if (!r.mux_playback_id) continue;
    const v = out.get(r.lesson_code) || { angles: [], seconds: null };
    v.angles.push({ label: r.angle || "Side", playbackId: r.mux_playback_id });
    v.seconds = v.seconds ?? r.duration_seconds ?? null;
    out.set(r.lesson_code, v);
  }
  return out;
}

// How many founding member spots are left, or null if we can't tell (demo mode).
export const getFoundingSpotsLeft = cache(async (): Promise<number | null> => {
  if (isDemo()) return FOUNDING_LIMIT;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { supabaseAdmin } = await import("./supabase/server");
  const { count, error } = await supabaseAdmin()
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .not("stripe_subscription_id", "is", null);
  if (error || count === null) return null;
  return Math.max(0, FOUNDING_LIMIT - count);
});
