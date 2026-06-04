"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const CHARSET = `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`;

const FONT_SIZE = 14;
const CHAR_WIDTH = FONT_SIZE * 0.62;
const MUTATION_RATIO = 0.07;

// Follow / shape easing for the embedded light.
const FOLLOW_EASE = 0.16;
const INTENSITY_EASE = 0.08;
const STRETCH_EASE = 0.12;
const MOVING_SPEED = 0.6;
const RADIUS_RATIO = 0.14;

type Palette = {
  low: [number, number, number];
  high: [number, number, number];
  baseAlpha: number;
  peakAlpha: number;
};

const palette: Record<"dark" | "light", Palette> = {
  dark: { low: [26, 92, 70], high: [92, 255, 216], baseAlpha: 0.16, peakAlpha: 0.92 },
  light: { low: [150, 152, 180], high: [30, 32, 70], baseAlpha: 0.22, peakAlpha: 0.85 },
};

const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

export default function AsciiBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mode = resolvedTheme === "dark" ? "dark" : "light";

    // ASCII background is dark-mode only; clear and bail out in light mode.
    if (mode !== "dark") {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    const { low, high, baseAlpha, peakAlpha } = palette[mode];

    let dpr = 1;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let radius = 0;
    let chars: string[] = [];

    // Light state (cursor-driven), shared with the brightness function.
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };
    let intensity = 0; // fades to 0 when the cursor is still
    let curStretch = 0;
    let curAngle = 0;
    let lightAngle = 0;
    let scaleX = 1;
    let scaleY = 1;

    let prevLit = new Map<number, number>();

    const cellColor = (b: number) => {
      const r = Math.round(low[0] + (high[0] - low[0]) * b);
      const g = Math.round(low[1] + (high[1] - low[1]) * b);
      const bl = Math.round(low[2] + (high[2] - low[2]) * b);
      const a = baseAlpha + (peakAlpha - baseAlpha) * b;
      return `rgba(${r}, ${g}, ${bl}, ${a})`;
    };

    const drawCell = (index: number, brightness: number) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * CHAR_WIDTH;
      const y = row * FONT_SIZE;
      ctx.clearRect(x, y, CHAR_WIDTH, FONT_SIZE);
      ctx.fillStyle = cellColor(brightness);
      ctx.fillText(chars[index], x, y);
    };

    // Elliptical falloff around the light, oriented along its motion.
    const brightnessAt = (px: number, py: number) => {
      const dx = px - head.x;
      const dy = py - head.y;
      const cos = Math.cos(lightAngle);
      const sin = Math.sin(lightAngle);
      const localX = (dx * cos + dy * sin) / scaleX;
      const localY = (-dx * sin + dy * cos) / scaleY;
      const d = Math.sqrt(localX * localX + localY * localY) / radius;
      if (d >= 1) return 0;
      const b = 1 - d;
      return b * b * (3 - 2 * b);
    };

    const drawAll = () => {
      ctx.clearRect(0, 0, width, height);
      for (let index = 0; index < chars.length; index++) {
        drawCell(index, 0);
      }
    };

    const setup = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";

      cols = Math.ceil(width / CHAR_WIDTH);
      rows = Math.ceil(height / FONT_SIZE);
      radius = Math.min(width, height) * RADIUS_RATIO;
      chars = Array.from({ length: cols * rows }, randomChar);

      target.x = width / 2;
      target.y = height * 0.32;
      head.x = target.x;
      head.y = target.y;

      prevLit = new Map();
      drawAll();
    };

    setup();

    const handleMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };

    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setup, 150);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("resize", handleResize);

    // Cycle a fraction of characters; redraw them with their current brightness.
    const mutationInterval = window.setInterval(() => {
      const mutations = Math.floor(chars.length * MUTATION_RATIO);
      for (let i = 0; i < mutations; i++) {
        const index = Math.floor(Math.random() * chars.length);
        chars[index] = randomChar();
        const col = index % cols;
        const row = Math.floor(index / cols);
        drawCell(
          index,
          brightnessAt((col + 0.5) * CHAR_WIDTH, (row + 0.5) * FONT_SIZE) * intensity
        );
      }
    }, 100);

    let rafId = 0;
    const render = () => {
      const vx = target.x - head.x;
      const vy = target.y - head.y;
      head.x += vx * FOLLOW_EASE;
      head.y += vy * FOLLOW_EASE;

      const speed = Math.hypot(vx, vy);
      const moving = speed > MOVING_SPEED;

      if (moving) curAngle = Math.atan2(vy, vx);
      const targetStretch = Math.min(speed * 0.01, 1.5);
      curStretch += (targetStretch - curStretch) * STRETCH_EASE;
      intensity += ((moving ? 1 : 0) - intensity) * INTENSITY_EASE;

      scaleX = 1 + curStretch;
      scaleY = 1 / Math.sqrt(1 + curStretch);
      lightAngle = curAngle;

      // Fully faded and nothing left lit: skip the scan entirely.
      if (intensity < 0.004 && prevLit.size === 0) {
        rafId = requestAnimationFrame(render);
        return;
      }

      // Cells inside the light's bounding box get their brightness refreshed.
      const reach = radius * Math.max(scaleX, scaleY) * 1.08;
      const minCol = Math.max(0, Math.floor((head.x - reach) / CHAR_WIDTH));
      const maxCol = Math.min(cols - 1, Math.ceil((head.x + reach) / CHAR_WIDTH));
      const minRow = Math.max(0, Math.floor((head.y - reach) / FONT_SIZE));
      const maxRow = Math.min(rows - 1, Math.ceil((head.y + reach) / FONT_SIZE));

      const nextLit = new Map<number, number>();
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const b =
            brightnessAt((col + 0.5) * CHAR_WIDTH, (row + 0.5) * FONT_SIZE) * intensity;
          if (b > 0.01) nextLit.set(row * cols + col, b);
        }
      }

      // Reset cells that were lit last frame but no longer are.
      prevLit.forEach((_, index) => {
        if (!nextLit.has(index)) drawCell(index, 0);
      });
      // Draw currently lit cells with their brightness.
      nextLit.forEach((b, index) => drawCell(index, b));

      prevLit = nextLit;
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(mutationInterval);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none h-full w-full", className)}
    />
  );
}
