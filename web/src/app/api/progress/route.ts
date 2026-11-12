import { getLesson } from "@/lib/catalog";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/viewer";

// { code: "B5.1", done: true } marks a lesson done (or not).
export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer.signedIn) return Response.json({ error: "sign_in" }, { status: 401 });
  if (viewer.demo) return Response.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const lesson = getLesson(String(body.code || ""));
  if (!lesson) return Response.json({ error: "unknown_lesson" }, { status: 400 });

  const sb = await supabaseServer();
  const res = body.done
    ? await sb.from("progress").upsert({ user_id: viewer.userId, lesson_code: lesson.code })
    : await sb.from("progress").delete().eq("user_id", viewer.userId!).eq("lesson_code", lesson.code);
  if (res.error) return Response.json({ error: "save_failed" }, { status: 500 });
  return Response.json({ ok: true });
}
