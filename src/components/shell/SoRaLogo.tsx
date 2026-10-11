"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./logo.module.css";

/*
 * Logo tròn. Dùng bản đã trim + xuất nhẹ trong public/logo.
 * CẤM dùng `05_ASSETS/logo/sora_logo_3d_transparent.png` (2,9 MB) trực tiếp.
 *   logo-320.webp  47 KB — sidebar Ø160 @2×
 *   logo-96.webp    7 KB — top bar điện thoại Ø48 @2×
 */
export function SoRaLogo({
  size,
  priority = false,
  className = "",
}: {
  size: number;
  priority?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const holder = root.current, video = videoRef.current, canvas = canvasRef.current;
    if (!holder || !video || !canvas) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const apple = /iPhone|iPad|iPod|Safari/.test(navigator.userAgent) &&
      (!/Chrome|Chromium|Edg|Android/.test(navigator.userAgent) || /iPhone|iPad|iPod/.test(navigator.userAgent));
    let packed = apple, visible = false, loaded = false, disposed = false;
    let frame = 0, animation = 0, lastTime = -1;
    const pixels = Math.min(384, Math.max(96, Math.ceil(size * Math.min(devicePixelRatio, 2))));
    canvas.width = canvas.height = pixels;
    const context = canvas.getContext("2d", {willReadFrequently: true});
    const mask = document.createElement("canvas");
    mask.width = mask.height = pixels;
    const maskContext = mask.getContext("2d", {willReadFrequently: true});
    const stopFrames = () => {
      if (frame && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(frame);
      cancelAnimationFrame(animation);frame = animation = 0;
    };
    const paint = () => {
      if (disposed || !visible || video.paused || video.readyState < 2) return;
      if (packed && context && maskContext && video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        const half = video.videoWidth / 2, height = video.videoHeight;
        context.drawImage(video, 0, 0, half, height, 0, 0, pixels, pixels);
        maskContext.drawImage(video, half, 0, half, height, 0, 0, pixels, pixels);
        const color = context.getImageData(0, 0, pixels, pixels);
        const alpha = maskContext.getImageData(0, 0, pixels, pixels).data;
        for (let i = 0; i < color.data.length; i += 4) color.data[i + 3] = alpha[i];
        context.putImageData(color, 0, 0);
      }
      holder.dataset.ready = "true";
      if (video.requestVideoFrameCallback) frame = video.requestVideoFrameCallback(paint);
      else animation = requestAnimationFrame(paint);
    };
    const play = () => {
      if (!visible || document.hidden || reduce.matches || disposed) {video.pause();stopFrames();return;}
      if (!loaded) {
        holder.dataset.mode = packed ? "packed" : "native";
        video.src = packed ? "/logo/sora-spin-alpha-v1.mp4" : "/logo/sora-spin-v1.webm";
        video.load();loaded = true;
      }
      video.muted = true;video.defaultMuted = true;
      void video.play().catch(() => { /* Poster remains until a user gesture permits playback. */ });
    };
    const playing = () => {stopFrames();paint();};
    const failed = () => {
      stopFrames();holder.dataset.ready = "false";
      if (!packed) {packed = true;loaded = false;play();}
    };
    video.addEventListener("playing", playing);
    video.addEventListener("error", failed);
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);play();
    }, {threshold: .01});
    observer.observe(holder);
    document.addEventListener("visibilitychange", play);
    document.addEventListener("pointerdown", play, {passive: true});
    reduce.addEventListener("change", play);
    return () => {
      disposed = true;observer.disconnect();stopFrames();video.pause();
      video.removeEventListener("playing", playing);video.removeEventListener("error", failed);
      document.removeEventListener("visibilitychange", play);document.removeEventListener("pointerdown", play);
      reduce.removeEventListener("change", play);video.removeAttribute("src");video.load();
    };
  }, [size]);
  return (
    <span ref={root} className={`${styles.logo} ${className}`} style={{width: size, height: size}} role="img" aria-label="SoRa" data-sora-logo>
      <Image src="/logo/sora-spin-poster-v1.png" alt="" width={size} height={size} priority={priority} sizes={`${size}px`} className={styles.poster}/>
      <video ref={videoRef} className={styles.video} aria-hidden="true" autoPlay muted loop playsInline preload="none" disablePictureInPicture controls={false} />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </span>
  );
}
