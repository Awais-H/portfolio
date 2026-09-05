/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_BASE =
  "size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border flex-none";

/** Round company/school logo that falls back to a blank circle if the image fails. */
export function LogoImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return <div className={cn(LOGO_BASE, "bg-muted")} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(LOGO_BASE, "overflow-hidden object-contain", className)}
      onError={() => setImageError(true)}
    />
  );
}
