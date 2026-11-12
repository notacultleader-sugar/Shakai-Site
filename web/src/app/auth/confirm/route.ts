import type { EmailOtpType } from "@supabase/supabase-js";
import { go, safeNext } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase/server";

// Where the sign-in link in the email lands.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") || "email") as EmailOtpType;

  const sb = await supabaseServer();
  const { error } = code
    ? await sb.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await sb.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing") };

  return go(error ? `/login?error=link&next=${encodeURIComponent(next)}` : next);
}
