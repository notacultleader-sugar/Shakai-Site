"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DoneButton({ code, initial }: { code: string; initial: boolean }) {
  const [done, setDone] = useState(initial);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, done: !done }),
    });
    setBusy(false);
    if (res.ok) {
      setDone(!done);
      router.refresh();
    }
  }

  return (
    <button className={`btn sm ${done ? "ghost" : ""}`} onClick={toggle} disabled={busy} aria-pressed={done}>
      {done ? "✓ Done" : "Mark as done"}
    </button>
  );
}
