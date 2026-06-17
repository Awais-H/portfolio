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
    <div className="flex items-start justify-between gap-x-3 w-full">
      <div className="flex items-start gap-x-3 flex-1 min-w-0">
        <LogoImage src={activity.logoUrl} alt={activity.organization} />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="font-semibold leading-none">
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
          <div className="font-sans text-sm text-muted-foreground">
            {activity.title}
          </div>
          {activity.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
              {activity.description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none pt-0.5">
        <span>
          {activity.start} - {activity.end ?? "Present"}
        </span>
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
      {educationEntries.map((education) => (
        <div key={education.school} className="flex flex-col">
          <Link
            href={education.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-x-3 group"
          >
            <LogoImage src={education.logoUrl} alt={education.school} />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="font-semibold leading-none flex items-center gap-2">
                {education.school}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
              </div>
              <div className="font-sans text-sm text-muted-foreground">
                {education.degree}
              </div>
            </div>
          </Link>

          {education.activities && education.activities.length > 0 ? (
            <div className="flex -mt-1">
              <div
                className="w-8 md:w-10 shrink-0 flex justify-center -mt-2"
                aria-hidden
              >
                <div className="w-px bg-border self-stretch min-h-full" />
              </div>
              <div className="flex-1 flex flex-col gap-6 pl-4 md:pl-6 pt-2">
                {education.activities.map((activity, index) => (
                  <div
                    key={activity.organization}
                    className={cn(
                      "relative",
                      index < education.activities!.length - 1 && "pb-0"
                    )}
                  >
                    <div
                      className="absolute -left-4 md:-left-6 top-4 md:top-5 w-4 md:w-6 h-px bg-border"
                      aria-hidden
                    />
                    <ActivityRow activity={activity} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
