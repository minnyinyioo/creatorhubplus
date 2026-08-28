import React, { useEffect, useRef } from "react";

/** “Hello, welcome” — rendered as sequential stream fragments rather than isolated combining marks. */
export const BURMESE_WELCOME_MESSAGE = "မင်္ဂလာပါ၊ ကြိုဆိုပါတယ်";

const WELCOME_STREAM = ["မင်္", "ဂ", "လာ", "ပါ", "၊", "ကြို", "ဆို", "ပါ", "တယ်"];
const BURMESE_TOKENS = ["မ", "န်", "က", "လ", "ာ", "ပ", "ကြ", "ို", "ဆ", "တ", "ယ်", "၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
const FONT_SIZE = 16;
export const RAIN_WAVE_AMPLITUDE = 7;

/** Decorative, non-interactive backdrop for the global terminal theme. */
export function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      columns = Math.ceil(window.innerWidth / FONT_SIZE);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -54));
      context.fillStyle = "#000000";
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    };

    const draw = (timestamp: number) => {
      context.fillStyle = "rgba(0, 0, 0, 0.12)";
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      context.font = `600 ${FONT_SIZE}px "Noto Sans Myanmar", "Myanmar Text", "Padauk", Consolas, monospace`;
      context.textBaseline = "top";

      drops.forEach((drop, column) => {
        const token = Math.random() > 0.38
          ? WELCOME_STREAM[Math.abs(drop + column) % WELCOME_STREAM.length]
          : BURMESE_TOKENS[Math.floor(Math.random() * BURMESE_TOKENS.length)];
        const wavePhase = timestamp / 440 + column * 0.46 + drop * 0.08;
        const x = column * FONT_SIZE + Math.sin(wavePhase) * RAIN_WAVE_AMPLITUDE;
        const y = drop * FONT_SIZE + Math.cos(wavePhase * 0.8) * (RAIN_WAVE_AMPLITUDE * 0.42);
        const head = Math.random() > 0.975;
        context.fillStyle = head ? "#dbffe4" : Math.random() > 0.8 ? "#50ff80" : "#00ff41";
        context.shadowBlur = head ? 14 : 5;
        context.shadowColor = "#00ff41";
        context.fillText(token, x, y);
        context.shadowBlur = 0;
        drops[column] = drop * FONT_SIZE > window.innerHeight && Math.random() > 0.976 ? Math.floor(Math.random() * -24) : drop + 1;
      });

      frameId = window.requestAnimationFrame(draw);
    };

    const start = () => {
      window.cancelAnimationFrame(frameId);
      resize();
      if (!motionQuery.matches) frameId = window.requestAnimationFrame(draw);
    };

    const visibilityChange = () => {
      if (document.hidden) window.cancelAnimationFrame(frameId);
      else if (!motionQuery.matches) frameId = window.requestAnimationFrame(draw);
    };

    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    motionQuery.addEventListener("change", start);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
      motionQuery.removeEventListener("change", start);
    };
  }, []);

  return <canvas ref={canvasRef} className="digital-rain" aria-hidden="true" />;
}
