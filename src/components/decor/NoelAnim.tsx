"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./noel.module.css";

/** Dây thông động (WebM VP9 trong suốt, đèn LED thật nhấp nháy). Safari/giảm chuyển động: không hiện, vẫn còn lớp tĩnh. */
export function NoelAnim({ src, className = "" }: { src: string; className?: string }) {
  const [ok, setOk] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const ua = navigator.userAgent;
    const safari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(min-width: 768px)").matches;
    const v = document.createElement("video");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOk(!safari && !reduce && v.canPlayType('video/webm; codecs="vp9"') !== "");
  }, []);
  if (!ok) return null;
  return (
    <video
      ref={ref}
      aria-hidden="true"
      data-decor=""
      className={`${styles.anim} ${className}`}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
