import { getViewer } from "@/lib/viewer";
import { BackField } from "./BackField";

// Shows only while no Supabase project is connected, so you can preview each tier.
export async function DemoBar() {
  const v = await getViewer();
  if (!v.demo) return null;
  const opts: [string, string][] = [["out", "Guest"], ["free", "Free"], ["beginner", "$10"], ["intermediate", "$15"], ["pro", "$20"]];
  const current = v.signedIn ? v.tier : "out";
  return (
    <div className="demobar" role="group" aria-label="Demo preview">
      <b>Demo</b>
      {opts.map(([t, label]) => (
        <form key={t} action="/demo" method="post">
          <input type="hidden" name="tier" value={t} />
          <BackField />
          <button aria-pressed={current === t}>{label}</button>
        </form>
      ))}
    </div>
  );
}
