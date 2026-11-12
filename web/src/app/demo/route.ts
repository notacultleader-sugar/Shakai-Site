import { cookies } from "next/headers";
import { isDemo } from "@/lib/config";
import { go, safeNext } from "@/lib/http";
import { isTier } from "@/lib/plans";
import { DEMO_COOKIE } from "@/lib/viewer";

// Demo mode only: switch which tier you're previewing as.
export async function POST(req: Request) {
  const form = await req.formData();
  const back = safeNext(form.get("back"), "/library");
  if (!isDemo()) return go(back);
  const tier = String(form.get("tier"));
  const jar = await cookies();
  if (tier === "out") jar.delete(DEMO_COOKIE);
  else if (isTier(tier)) jar.set(DEMO_COOKIE, tier, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  return go(back);
}
