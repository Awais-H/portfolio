/** Pill label between two fading rules, with the section title underneath. */
export function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex flex-col gap-y-4 items-center justify-center">
      <div className="flex items-center w-full">
        <div
          className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent"
          aria-hidden
        />
        <div className="border bg-primary z-10 rounded-xl px-4 py-1">
          <span className="text-background text-sm font-medium">{label}</span>
        </div>
        <div
          className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent"
          aria-hidden
        />
      </div>
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{title}</h2>
    </div>
  );
}
