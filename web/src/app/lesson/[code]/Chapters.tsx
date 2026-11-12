"use client";
import { useState } from "react";

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function Chapters({ chapters, playable }: { chapters: [number, string][]; playable: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <ol className="chapters">
      {chapters.map(([t, label], i) => (
        <li key={t}>
          <button
            type="button"
            className={i === active ? "on" : undefined}
            disabled={!playable}
            onClick={() => {
              setActive(i);
              window.dispatchEvent(new CustomEvent("shakai:seek", { detail: t }));
            }}
          >
            <span className="ts">{clock(t)}</span>
            <span>{label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
