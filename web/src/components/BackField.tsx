"use client";
import { usePathname } from "next/navigation";

// Hidden field holding the current page, so a form can send you back here.
export function BackField() {
  return <input type="hidden" name="back" value={usePathname() || "/library"} />;
}
