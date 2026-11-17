"use client";

// Camera buttons that sit on the video, top right. Only shown when a lesson has more than one angle.
export function AngleSwitch({ labels, current, onPick }: { labels: string[]; current: number; onPick: (i: number) => void }) {
  return (
    <div className="angles" role="group" aria-label="Camera angle">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4.5h7.5c.8 0 1.5.7 1.5 1.5v.8l3-2v6.4l-3-2v.8c0 .8-.7 1.5-1.5 1.5H2c-.8 0-1.5-.7-1.5-1.5V6c0-.8.7-1.5 1.5-1.5z" /></svg>
      {labels.map((label, i) => (
        <button key={label} type="button" aria-pressed={i === current} onClick={() => onPick(i)}>
          {label}
        </button>
      ))}
    </div>
  );
}
