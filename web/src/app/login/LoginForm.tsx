"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LoginForm({ next }: { next: string }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL.test(clean)) return setError("That email doesn't look right. Mind checking it?");
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) return setError(error.status === 429 ? "Too many tries. Wait a minute, then try again." : "We couldn't send the code. Try again in a moment.");
    setEmail(clean);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) return setError("Enter the code from the email.");
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.verifyOtp({ email, token, type: "email" });
    if (error) {
      setBusy(false);
      return setError("That code didn't work. Check it, or send a new one.");
    }
    window.location.assign(next);
  }

  if (step === "code") {
    return (
      <form className="card glow stack" onSubmit={verify}>
        <p className="okmsg">Code sent to {email}</p>
        <div className="field">
          <label htmlFor="code">6 digit code</label>
          <input id="code" className="input code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn block" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
        <p className="small muted">
          You can also just tap the link in the email.{" "}
          <button type="button" className="link" style={{ background: "none", border: 0, cursor: "pointer" }} onClick={() => { setStep("email"); setCode(""); setError(""); }}>
            Use a different email
          </button>
        </p>
      </form>
    );
  }

  return (
    <form className="card glow stack" onSubmit={sendCode} noValidate>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" spellCheck={false} placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn block" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button>
    </form>
  );
}
