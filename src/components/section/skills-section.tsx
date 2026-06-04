"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DATA } from "@/data/resume";

export default function SkillsSection() {
  const categories = DATA.skillCategories;
  const defaultCategoryId = categories[0]?.id ?? "";
  const [activeCategoryId, setActiveCategoryId] = useState(defaultCategoryId);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId),
    [activeCategoryId, categories]
  );

  if (categories.length === 0) {
    return (
      <div className="border border-border rounded-xl p-6 text-sm text-muted-foreground">
        No skills listed yet. Add them in <code>src/data/resume.tsx</code>.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-y-5">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategoryId(category.id)}
            className={`h-8 px-4 rounded-xl border text-sm transition-colors ${
              category.id === activeCategoryId
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {activeCategory?.skills.map((skill) => (
          <Badge
            key={skill}
            className="text-[11px] font-medium border border-border h-6 w-fit px-2"
            variant="outline"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
