import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Awais Hashar",
  initials: "AH",
  url: "https://example.com",
  location: "",
  locationLink: "",
  description: "A clean, empty portfolio template.",
  summary:
    "This site starts intentionally empty. Edit `src/data/resume.tsx` to add your own bio, work, education, projects, and social links.",
  avatarUrl: "",
  skills: [],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "you@example.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/your-username",
        icon: Icons.github,
        navbar: false,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/your-profile",
        icon: Icons.linkedin,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:you@example.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },
  work: [],
  education: [],
  projects: [],
  hackathons: [],
} as const;
