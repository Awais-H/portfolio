import Link from "next/link";
import { DATA } from "@/data/resume";

export default function ContactSection() {
  const emailHref = DATA.contact.email
    ? `mailto:${DATA.contact.email}`
    : "mailto:you@example.com";

  return (
    <div className="border rounded-xl p-10 relative">
      <div className="absolute -top-4 border bg-primary z-10 rounded-xl px-4 py-1 left-1/2 -translate-x-1/2">
        <span className="text-background text-sm font-medium">Contact</span>
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center">
        <p className="mx-auto max-w-lg text-muted-foreground text-balance">
          Feel free to reach out at{" "}
          <Link
            href={emailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            {DATA.contact.email || "you@example.com"}
          </Link>{" "}
          :)
        </p>
      </div>
    </div>
  );
}
