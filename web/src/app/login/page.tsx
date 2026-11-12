import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isDemo } from "@/lib/config";
import { safeNext } from "@/lib/http";
import { getViewer } from "@/lib/viewer";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const next = safeNext(q.next);
  const v = await getViewer();
  if (v.signedIn) redirect(next);

  return (
    <div className="wrap">
      <div className="auth">
        <span className="eyebrow"><i />Sign in or join free</span>
        <h1 className="h2">Your <em>chair</em> is waiting.</h1>
        <p className="muted">Enter your email and we&apos;ll send you a 6 digit code. No password to remember. New here? This makes your free account.</p>
        {q.error === "link" && <p className="err">That sign in link didn&apos;t work or has expired. Ask for a new code below.</p>}
        {isDemo() ? (
          <form className="card stack" action="/demo" method="post">
            <input type="hidden" name="tier" value="free" />
            <input type="hidden" name="back" value={next} />
            <p className="small muted">Demo mode: no emails are sent. Tap below to sign in as a free member.</p>
            <button className="btn block">Continue (demo)</button>
          </form>
        ) : (
          <LoginForm next={next} />
        )}
      </div>
    </div>
  );
}
