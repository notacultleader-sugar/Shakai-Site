import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Runs before every page.
// 1. While PREVIEW_USER is set, the whole site sits behind a password (test preview).
// 2. Keeps the member's sign-in fresh.
export async function proxy(request: NextRequest) {
  const locked = await previewGate(request);
  if (locked) return locked;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return withPreviewHeaders(NextResponse.next());

  let response = NextResponse.next({ request });
  const sb = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await sb.auth.getUser();
  return withPreviewHeaders(response);
}

// Browser password prompt for the test site. PREVIEW_USER is set in wrangler.jsonc;
// PREVIEW_PASSWORD is a Cloudflare secret (never in the code, the repo is public).
// If the user is set but the secret isn't, nobody gets in.
async function previewGate(request: NextRequest) {
  const user = process.env.PREVIEW_USER;
  if (!user) return null;
  const pass = process.env.PREVIEW_PASSWORD;
  const header = request.headers.get("authorization") || "";
  if (pass && header.startsWith("Basic ")) {
    try {
      const decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0)));
      const i = decoded.indexOf(":");
      // Ignore capitals in the username and stray spaces (phones add both).
      const name = decoded.slice(0, i).trim().toLowerCase();
      if (same(name, user.trim().toLowerCase()) && same(decoded.slice(i + 1).trim(), pass.trim())) return null;
    } catch {
      // fall through to the prompt
    }
  }
  // Shown if you tap Cancel on the login box, to help spot setup problems.
  const message = !pass
    ? "Shakai test site: the password isn't set up on the server yet (PREVIEW_PASSWORD is missing)."
    : header
      ? "Shakai test site: wrong username or password. Reload to try again."
      : "Shakai test site: password needed. Reload to try again.";
  return new NextResponse(message, {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Shakai test site", charset="UTF-8"', "X-Robots-Tag": "noindex" },
  });
}

// Compare without leaking how many characters matched.
function same(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// Keep the test site out of Google.
function withPreviewHeaders(res: NextResponse) {
  if (process.env.PREVIEW_USER) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|api/stripe/webhook|favicon.png|apple-touch-icon.png).*)"],
};
