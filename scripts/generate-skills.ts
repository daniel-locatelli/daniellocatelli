import fs from "fs";
import path from "path";

const skillsProgramming = [
  { title: "HTML", level: "Advanced" },
  { title: "CSS", level: "Advanced" },
  { title: "TypeScript", level: "Advanced" },
  { title: "Python", level: "Intermediate" },
  { title: "C#", level: "Intermediate" },
];

const skillsFrameworks = [
  { title: "Astro", level: "Advanced" },
  { title: "Tailwind", level: "Advanced" },
  { title: "React", level: "Advanced" },
  { title: "TanStack Start", level: "Intermediate" },
  { title: "Flask", level: "Intermediate" },
];

const skillsDatabases = [
  {
    title: "PostgreSQL",
    level: "Advanced",
    link: "https://www.postgresql.org/",
  },
  {
    title: "MongoDB",
    level: "Intermediate",
    link: "https://www.mongodb.com/",
  },
];

const skillsDesign = [
  { title: "Rhino", level: "Advanced" },
  { title: "Grasshopper", level: "Advanced" },
  { title: "Revit", level: "Advanced" },
  { title: "Figma", level: "Intermediate" },
  { title: "Adobe Creative Cloud", level: "Advanced" },
];

const skillsSpecialized = [
  "Web Development",
  "Computational Design",
  "UI/UX Design",
];

const skillsLanguages = [
  { title: "English", level: "fluent" },
  { title: "German", level: "B1" },
  { title: "Portuguese", level: "fluent" },
];

const allSkills = [
  ...skillsProgramming.map((s) => ({ ...s, category: "Programming" })),
  ...skillsFrameworks.map((s) => ({ ...s, category: "Frameworks" })),
  ...skillsDatabases.map((s) => ({ ...s, category: "Databases" })),
  ...skillsDesign.map((s) => ({ ...s, category: "Design Tools" })),
  ...skillsSpecialized.map((s) => ({
    title: s,
    level: "Advanced",
    category: "Specialization",
  })),
  ...skillsLanguages.map((s) => ({ ...s, category: "Languages" })),
];

const outDir = path.resolve("src/content/skills/en");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

allSkills.forEach((skill) => {
  const slug = skill.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const frontmatter = `---
Name: "${skill.title}"
Slug: "${slug}"
Category: "${skill.category}"
Level: "${skill.level || ""}"
Link: "${(skill as any).link || ""}"
Locale: "en"
---
`;

  fs.writeFileSync(path.join(outDir, `${slug}.md`), frontmatter);
  console.log(`Generated ${slug}.md`);
});
