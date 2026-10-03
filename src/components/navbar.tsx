import { Dock, DockIcon } from "@/components/effects/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import type { ReactNode } from "react";

const DOCK_ICON_CLASS =
  "rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors";
const TOOLTIP_CLASS =
  "rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]";

function DockTooltip({ label }: { label: string }) {
  return (
    <TooltipContent side="top" sideOffset={8} className={TOOLTIP_CLASS}>
      <p>{label}</p>
      <TooltipArrow className="fill-primary" />
    </TooltipContent>
  );
}

function DockLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const isExternal = href.startsWith("http");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          aria-label={label}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <DockIcon className={DOCK_ICON_CLASS}>{children}</DockIcon>
        </a>
      </TooltipTrigger>
      <DockTooltip label={label} />
    </Tooltip>
  );
}

export default function Navbar() {
  const navbarSocials = Object.values(DATA.contact.social).filter(
    (social) => social.navbar
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
      <Dock className="z-50 pointer-events-auto relative h-14 p-2 w-fit mx-auto flex gap-2 border bg-card/90 backdrop-blur-3xl shadow-[0_0_10px_3px] shadow-primary/5">
        {DATA.navbar.map((item) => (
          <DockLink key={item.href} href={item.href} label={item.label}>
            <item.icon className="size-full rounded-sm overflow-hidden object-contain" />
          </DockLink>
        ))}
        {navbarSocials.length > 0 && (
          <Separator
            orientation="vertical"
            className="h-2/3 m-auto w-px bg-border"
          />
        )}
        {navbarSocials.map((social) => (
          <DockLink key={social.name} href={social.url} label={social.name}>
            <social.icon className="size-full rounded-sm overflow-hidden object-contain" />
          </DockLink>
        ))}
        <Separator
          orientation="vertical"
          className="h-2/3 m-auto w-px bg-border"
        />
        <Tooltip>
          <DockIcon className={DOCK_ICON_CLASS}>
            {/* DockIcon doesn't forward refs/handlers, so the trigger has to sit on the button itself */}
            <TooltipTrigger asChild>
              <ModeToggle className="size-full cursor-pointer" />
            </TooltipTrigger>
          </DockIcon>
          <DockTooltip label="Theme" />
        </Tooltip>
      </Dock>
    </div>
  );
}
