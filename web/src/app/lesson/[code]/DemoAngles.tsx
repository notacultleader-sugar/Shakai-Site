"use client";
import { useState } from "react";
import { AngleSwitch } from "./AngleSwitch";

// Demo only: shows how the camera buttons look before real videos exist.
export function DemoAngles({ labels }: { labels: string[] }) {
  const [current, setCurrent] = useState(0);
  return (
    <>
      <span className="poster-angle">{labels[current]} camera</span>
      <AngleSwitch labels={labels} current={current} onPick={setCurrent} />
    </>
  );
}
