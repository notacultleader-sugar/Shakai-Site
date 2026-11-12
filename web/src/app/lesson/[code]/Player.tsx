"use client";
import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useRef } from "react";

type Props = { playbackId: string; title: string; tokens: { playback: string; thumbnail: string; storyboard: string } };

export const SEEK_EVENT = "shakai:seek";

export function Player({ playbackId, title, tokens }: Props) {
  const ref = useRef<HTMLVideoElement & { play(): Promise<void> }>(null);

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

  return (
    <MuxPlayer
      ref={ref as never}
      playbackId={playbackId}
      tokens={tokens}
      metadata={{ video_title: title }}
      accentColor="#ff1493"
      streamType="on-demand"
      playsInline
    />
  );
}
