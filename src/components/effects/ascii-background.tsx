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
const MOVING_SPEED = 0.6;
const RADIUS_RATIO = 0.14;
// The light is drawn along a trail of recent positions so it bends with the
// cursor path (curls when moving in circles) instead of being a straight blob.
const TRAIL_POINTS = 20;
const HALF_HEAD_RATIO = 0.55; // half-width at the head (× radius)
const HALF_TAIL_RATIO = 0.13; // half-width at the tail (× radius)

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
  const activeRef = useRef(true);
  const startLoopRef = useRef<(() => void) | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);

  const isDark = resolvedTheme !== "light";

  useEffect(() => {
    activeRef.current = isDark;
    if (isDark) startLoopRef.current?.();
    else stopLoopRef.current?.();
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { low, high, baseAlpha, peakAlpha } = palette.dark;

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
    const trail: { x: number; y: number }[] = [];
    let intensity = 0; // fades to 0 when the cursor is still
    let halfHead = 0;
    let halfTail = 0;

    let prevLit = new Map<number, number>();
    let rafId = 0;
    let running = false;

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

    // Tapered ribbon along the trail polyline: wide/bright at the head, thin
    // and dim toward the tail. Following the path lets it curve with the cursor.
    const brightnessAt = (px: number, py: number) => {
      const n = trail.length;
      if (n === 0) return 0;

      let best = 0;
      const segments = n - 1;

      if (segments <= 0) {
        const dx = px - trail[0].x;
        const dy = py - trail[0].y;
        const dist = Math.hypot(dx, dy);
        best = halfHead > 0 ? 1 - dist / halfHead : 0;
      } else {
        for (let i = 0; i < segments; i++) {
          const a = trail[i];
          const b = trail[i + 1];
          const abx = b.x - a.x;
          const aby = b.y - a.y;
          const apx = px - a.x;
          const apy = py - a.y;
          const len2 = abx * abx + aby * aby;
          let t = len2 > 0 ? (apx * abx + apy * aby) / len2 : 0;
          if (t < 0) t = 0;
          else if (t > 1) t = 1;

          const cx = a.x + abx * t;
          const cy = a.y + aby * t;
          const dist = Math.hypot(px - cx, py - cy);

          const s = (i + t) / segments; // 0 = tail, 1 = head
          const halfWidth = halfTail + (halfHead - halfTail) * s;
          const perp = 1 - dist / halfWidth;
          if (perp > 0) {
            const contrib = perp * (0.3 + 0.7 * s);
            if (contrib > best) best = contrib;
          }
        }
      }

      if (best <= 0) return 0;
      const b = Math.min(1, best);
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
      halfHead = radius * HALF_HEAD_RATIO;
      halfTail = radius * HALF_TAIL_RATIO;
      chars = Array.from({ length: cols * rows }, randomChar);

      target.x = width / 2;
      target.y = height * 0.32;
      head.x = target.x;
      head.y = target.y;
      trail.length = 0;

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
      if (!activeRef.current) return;

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

    const render = () => {
      if (!running) return;

      const vx = target.x - head.x;
      const vy = target.y - head.y;
      head.x += vx * FOLLOW_EASE;
      head.y += vy * FOLLOW_EASE;

      const speed = Math.hypot(vx, vy);
      const moving = speed > MOVING_SPEED;

      intensity += ((moving ? 1 : 0) - intensity) * INTENSITY_EASE;

      // Record the path so the light bends along the cursor's recent motion.
      trail.push({ x: head.x, y: head.y });
      while (trail.length > TRAIL_POINTS) trail.shift();

      // Fully faded and nothing left lit: skip the scan entirely.
      if (intensity < 0.004 && prevLit.size === 0) {
        rafId = requestAnimationFrame(render);
        return;
      }

      // Bounding box around the whole trail, padded by the widest half-width.
      let tMinX = Infinity;
      let tMinY = Infinity;
      let tMaxX = -Infinity;
      let tMaxY = -Infinity;
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        if (p.x < tMinX) tMinX = p.x;
        if (p.x > tMaxX) tMaxX = p.x;
        if (p.y < tMinY) tMinY = p.y;
        if (p.y > tMaxY) tMaxY = p.y;
      }
      const pad = halfHead * 1.15;
      const minCol = Math.max(0, Math.floor((tMinX - pad) / CHAR_WIDTH));
      const maxCol = Math.min(cols - 1, Math.ceil((tMaxX + pad) / CHAR_WIDTH));
      const minRow = Math.max(0, Math.floor((tMinY - pad) / FONT_SIZE));
      const maxRow = Math.min(rows - 1, Math.ceil((tMaxY + pad) / FONT_SIZE));

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

    const startLoop = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(render);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    startLoopRef.current = startLoop;
    stopLoopRef.current = stopLoop;

    if (activeRef.current) startLoop();
    else stopLoop();

    return () => {
      stopLoop();
      startLoopRef.current = null;
      stopLoopRef.current = null;
      window.clearInterval(mutationInterval);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none h-full w-full",
        !isDark && "invisible",
        className
      )}
    />
  );
}
