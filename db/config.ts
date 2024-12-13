import { column, defineDb, defineTable } from "astro:db";

const Summary = defineTable({
  columns: {
    text: column.text(),
    locale: column.text(),
  },
});

const SkillProgramming = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillFrameworks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillDatabases = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillDesign = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillSpecialized = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    locale: column.text(),
  },
});

const Experience = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    dateIn: column.date(),
    dateOut: column.date(),
    title: column.text(),
    titleNote: column.text({ optional: true }),
    company: column.text(),
    companyNote: column.text({ optional: true }),
    location: column.text(),
  },
});

const ExperienceTask = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    experienceId: column.text({
      references: () => Experience.columns.id,
    }),
    locale: column.text(),
    text: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Summary,
    SkillProgramming,
    SkillFrameworks,
    SkillDatabases,
    SkillDesign,
    SkillSpecialized,
    Experience,
    ExperienceTask,
  },
});
