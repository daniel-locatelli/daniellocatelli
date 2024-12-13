import { db, SkillProgramming } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(SkillProgramming).values([
    { id: 1, name: "HTML", level: "Advanced" },
    { id: 2, name: "CSS", level: "Advanced" },
    { id: 3, name: "JavaScript", level: "Advanced" },
    { id: 4, name: "Python", level: "Intermediate" },
    { id: 5, name: "C#", level: "Intermediate" },
  ]);
}
