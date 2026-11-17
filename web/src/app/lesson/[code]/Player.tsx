"use client";
import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef, useState } from "react";
import { AngleSwitch } from "./AngleSwitch";

type Tokens = { playback: string; thumbnail: string; storyboard: string };
export type PlayerAngle = { label: string; playbackId: string; tokens: Tokens };
type Props = { angles: PlayerAngle[]; title: string };
type Media = HTMLVideoElement & { play(): Promise<void> };

export const SEEK_EVENT = "shakai:seek";
const ANGLE_KEY = "shakai_angle";

// Plays one camera angle at a time. Switching angles keeps the same moment in
// the lesson and keeps playing if it was playing.
export function Player({ angles, title }: Props) {
  const ref = useRef<Media>(null);
  const [current, setCurrent] = useState(0);
  const pending = useRef<{ time: number; play: boolean } | null>(null);

  // Start on the angle this member picked last time, if this lesson has it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ANGLE_KEY);
      const i = angles.findIndex((a) => a.label === saved);
      if (i > 0) setCurrent(i);
    } catch {
      // storage blocked: just use the first angle
    }
  }, [angles]);

  // Chapter buttons beside the video jump to a time.
  useEffect(() => {
    const onSeek = (e: Event) => {
      const el = ref.current;
      if (!el) return;
      el.currentTime = (e as CustomEvent<number>).detail;
      el.play().catch(() => {});
    };
    window.addEventListener(SEEK_EVENT, onSeek);
    return () => window.removeEventListener(SEEK_EVENT, onSeek);
  }, []);

  function switchTo(i: number) {
    if (i === current) return;
    const el = ref.current;
    pending.current = el ? { time: el.currentTime || 0, play: !el.paused } : null;
    setCurrent(i);
    try {
      localStorage.setItem(ANGLE_KEY, angles[i].label);
    } catch {
      // fine
    }
  }

  // Once the new angle has loaded, jump to where the old one was.
  function onLoaded() {
    const el = ref.current;
    const p = pending.current;
    if (!el || !p) return;
    pending.current = null;
    el.currentTime = p.time;
    if (p.play) el.play().catch(() => {});
  }

  const angle = angles[current];
  return (
    <>
      <MuxPlayer
        ref={ref as never}
        playbackId={angle.playbackId}
        tokens={angle.tokens}
        metadata={{ video_title: `${title} (${angle.label})` }}
        accentColor="#ff1493"
        streamType="on-demand"
        playsInline
        onLoadedMetadata={onLoaded}
      />
      {angles.length > 1 && <AngleSwitch labels={angles.map((a) => a.label)} current={current} onPick={switchTo} />}
    </>
  );
}
