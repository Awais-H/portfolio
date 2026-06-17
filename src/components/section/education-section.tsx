/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DATA } from "@/data/resume";
import { Timeline, TimelineConnectItem, TimelineItem } from "@/components/timeline";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
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
  highlights?: readonly string[];
};

type EducationEntry = {
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  start: string;
  end: string;
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

function ActivityContent({ activity }: { activity: EducationActivity }) {
  const hasHighlights = activity.highlights && activity.highlights.length > 0;

  const titleBlock = (
    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      <div className="font-semibold leading-none flex items-center gap-2">
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
        {hasHighlights ? (
          <span className="relative inline-flex items-center w-3.5 h-3.5">
            <ChevronRight
              className={cn(
                "absolute h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2 transition-all duration-300 ease-out",
                "translate-x-0 opacity-0",
                "group-hover:translate-x-1 group-hover:opacity-100",
                "group-data-[state=open]:opacity-0 group-data-[state=open]:translate-x-0"
              )}
            />
            <ChevronDown
              className={cn(
                "absolute h-3.5 w-3.5 shrink-0 text-muted-foreground stroke-2 transition-all duration-200",
                "opacity-0 rotate-0",
                "group-data-[state=open]:opacity-100 group-data-[state=open]:rotate-180"
              )}
            />
          </span>
        ) : null}
      </div>
      <div className="font-sans text-sm text-muted-foreground">
        {activity.title}
      </div>
    </div>
  );

  if (!hasHighlights) {
    return titleBlock;
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={activity.organization}
      className="w-full"
    >
      <AccordionItem value={activity.organization} className="border-b-0">
        <AccordionTrigger className="hover:no-underline p-0 cursor-pointer transition-colors rounded-none group [&>svg]:hidden">
          {titleBlock}
        </AccordionTrigger>
        <AccordionContent className="p-0 pt-3 text-xs sm:text-sm text-muted-foreground">
          <ul className="list-disc space-y-1.5 pl-4">
            {activity.highlights!.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
        <div key={education.school} className="flex flex-col gap-4">
          <Link
            href={education.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-x-3 justify-between group"
          >
            <div className="flex items-center gap-x-3 flex-1 min-w-0">
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
            </div>
            <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none">
              <span>
                {education.start} - {education.end}
              </span>
            </div>
          </Link>

          {education.activities && education.activities.length > 0 ? (
            <Timeline className="p-0 [--timeline-gap:1.5rem]">
              {education.activities.map((activity) => (
                <TimelineItem
                  key={activity.organization}
                  className="w-full flex items-start justify-between gap-10"
                >
                  <div className="flex items-start gap-x-3 flex-1 min-w-0">
                    <TimelineConnectItem className="flex items-start justify-center">
                      <LogoImage
                        src={activity.logoUrl}
                        alt={activity.organization}
                      />
                    </TimelineConnectItem>
                    <div className="flex flex-1 flex-col justify-start min-w-0 pt-0.5">
                      <ActivityContent activity={activity} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none pt-0.5">
                    <span>
                      {activity.start} - {activity.end ?? "Present"}
                    </span>
                  </div>
                </TimelineItem>
              ))}
            </Timeline>
          ) : null}
        </div>
      ))}
    </div>
  );
}
