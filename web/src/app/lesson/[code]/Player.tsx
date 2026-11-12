"use client";
import MuxPlayer from "@mux/mux-player-react";

type Props = { playbackId: string; title: string; tokens: { playback: string; thumbnail: string; storyboard: string } };

export function Player({ playbackId, title, tokens }: Props) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={tokens}
      metadata={{ video_title: title }}
      accentColor="#ff1493"
      streamType="on-demand"
      playsInline
    />
  );
}
