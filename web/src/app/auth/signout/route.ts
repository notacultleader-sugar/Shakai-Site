import { cookies } from "next/headers";
import { isDemo } from "@/lib/config";
import { go } from "@/lib/http";
import { supabaseServer } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/viewer";

export async function POST() {
  if (isDemo()) (await cookies()).delete(DEMO_COOKIE);
  else await (await supabaseServer()).auth.signOut();
  return go("/");
}
