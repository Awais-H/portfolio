"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// With reducedMotion="user", motion skips transform animations (the slide in
// BlurFade/BlurFadeText) when the OS asks for reduced motion; fades still run.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
