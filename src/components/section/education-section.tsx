/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { DATA } from "@/data/resume";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type EducationActivity = {
  organization: string;
  href?: string;
  location: string;
  title: string;
  logoUrl: string;
  start: string;
  end?: string;
  description?: string;
};

type EducationEntry = {
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  activities?: readonly EducationActivity[];
};

const TIMELINE_LINE = "bg-muted-foreground/40";
/** 3/4 of the original pl-4/pl-6 + timeline-column offset (48px / 64px → 36px / 48px) */
const ACTIVITY_INDENT = "ml-9 md:ml-12";
/** Horizontal branch width: indent minus vertical line offset */
const BRANCH_WIDTH = "w-[1.375rem] md:w-8";

function LogoImage({
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
    return (
      <div className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border bg-muted flex-none" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border overflow-hidden object-contain flex-none bg-card",
        className
      )}
      onError={() => setImageError(true)}
    />
  );
}

function ActivityRow({ activity }: { activity: EducationActivity }) {
  return (
    <div className="flex items-start gap-x-3 w-full min-w-0">
      <div className="relative w-8 md:w-10 shrink-0 flex items-center justify-center">
        <div
          className={cn(
            "absolute right-full top-1/2 -translate-y-1/2 h-0.5",
            BRANCH_WIDTH,
            TIMELINE_LINE
          )}
          aria-hidden
        />
        <LogoImage src={activity.logoUrl} alt={activity.organization} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5 pt-0.5">
        <div className="flex items-start justify-between gap-x-3">
          <div className="font-semibold leading-none min-w-0">
            {activity.href ? (
              <Link
                href={activity.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2"
              >
                {activity.organization}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" aria-hidden />
              </Link>
            ) : (
              activity.organization
            )}
          </div>
          <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none">
            <span>
              {activity.start} - {activity.end ?? "Present"}
            </span>
          </div>
        </div>
        <div className="font-sans text-sm text-muted-foreground">
          {activity.title}
        </div>
        {activity.description ? (
          <p className="text-sm text-muted-foreground whitespace-nowrap pt-0.5">
            {activity.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function EducationSection() {
  const educationEntries = DATA.education as readonly EducationEntry[];

  if (educationEntries.length === 0) {
    return (
      <div className="border border-border rounded-xl p-6 text-sm text-muted-foreground">
        No education entries yet. Add them in <code>src/data/resume.tsx</code>.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {educationEntries.map((education) => {
        const hasActivities =
          education.activities && education.activities.length > 0;

        return (
          <div key={education.school} className="relative flex flex-col">
            {hasActivities ? (
              <div
                className={cn(
                  "pointer-events-none absolute left-3.5 md:left-4 top-8 md:top-10 bottom-4 w-0.5",
                  TIMELINE_LINE
                )}
                aria-hidden
              />
            ) : null}

            <Link
              href={education.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-x-3 group"
            >
              <LogoImage src={education.logoUrl} alt={education.school} />
              <div className="flex-1 min-w-0 flex flex-col gap-0.5 pt-0.5">
                <div className="font-semibold leading-none flex items-center gap-2">
                  {education.school}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
                </div>
                <div className="font-sans text-sm text-muted-foreground">
                  {education.degree}
                </div>
              </div>
            </Link>

            {hasActivities ? (
              <div className={cn("flex flex-col gap-6 mt-6", ACTIVITY_INDENT)}>
                {education.activities!.map((activity) => (
                  <ActivityRow key={activity.organization} activity={activity} />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
