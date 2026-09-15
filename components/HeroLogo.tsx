"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const HOLD_MS = 5000;
const FADE_MS = 500;
const VIDEO_SRC = "/ah-logo-ani.mp4?v=flush";
const VIDEO_SCALE = 0.984;

export function HeroLogo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowMotion, setAllowMotion] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowMotion(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!allowMotion) {
      setShowVideo(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const timers = new Set<number>();

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const seekToStart = () =>
      new Promise<void>((resolve) => {
        if (video.currentTime === 0 && !video.ended) {
          resolve();
          return;
        }
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = 0;
      });

    const waitForEnded = () =>
      new Promise<void>((resolve) => {
        if (video.ended) {
          resolve();
          return;
        }
        const onEnded = () => {
          video.removeEventListener("ended", onEnded);
          resolve();
        };
        video.addEventListener("ended", onEnded);
      });

    const run = async () => {
      while (!cancelled) {
        await wait(HOLD_MS);
        if (cancelled) return;
        try {
          await seekToStart();
          if (cancelled) return;
          await video.play();
          if (cancelled) {
            video.pause();
            return;
          }
          setShowVideo(true);
          await waitForEnded();
        } catch {
          setShowVideo(false);
          continue;
        }
        if (cancelled) return;
        setShowVideo(false);
        await wait(FADE_MS);
      }
    };

    void run();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      video.pause();
      setShowVideo(false);
    };
  }, [allowMotion]);

  return (
    <div className="relative aspect-square w-full max-w-md">
      <Image
        src="/ah-logo.png"
        alt="AppHole logo: a glossy red apple with a hole, blue swirl on the left and green swirl on the right"
        className="absolute inset-0 h-full w-full object-contain"
        width={520}
        height={520}
        priority
      />
      {allowMotion ? (
        <video
          ref={videoRef}
          className={`pointer-events-none absolute inset-0 h-full w-full origin-center object-contain transition-opacity ease-in-out ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms`, transform: `scale(${VIDEO_SCALE})` }}
          width={544}
          height={544}
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
