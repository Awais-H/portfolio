import BlurFade from "@/components/effects/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { SectionHeader } from "@/components/section/section-header";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";

const BLUR_FADE_DELAY = 0.04;

export default function ProjectsSection() {
  return (
    <div>
      <div className="flex min-h-0 flex-col gap-y-8">
        <SectionHeader label="Projects" title="Featured work" />
        {DATA.projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto auto-rows-fr">
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                className={cn(
                  "h-full",
                  id === DATA.projects.length - 1 &&
                    DATA.projects.length % 2 === 1 &&
                    "sm:col-span-2 sm:max-w-[calc(50%-0.375rem)] sm:justify-self-center"
                )}
              >
                <ProjectCard
                  href={project.href}
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl p-6 text-sm text-muted-foreground text-center">
            No projects added yet.
          </div>
        )}
      </div>
    </div>
  );
}

