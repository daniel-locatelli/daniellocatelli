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

const ExperienceItems = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    experienceId: column.text({
      references: () => Experience.columns.id,
    }),
    locale: column.text(),
    text: column.text(),
  },
});

const Education = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    dateIn: column.date(),
    dateOut: column.date(),
    title: column.text(),
    institution: column.text(),
    location: column.text(),
  },
});

const EducationItems = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    educationId: column.text({
      references: () => Education.columns.id,
    }),
    locale: column.text(),
    text: column.text(),
  },
});

const Scholarships = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    dateIn: column.date(),
    dateOut: column.date(),
    title: column.text(),
    institution: column.text(),
    description: column.text(),
  },
});

const Publications = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    date: column.date(),
    title: column.text(),
    publisher: column.text(),
    location: column.text({ optional: true }),
  },
});

const Person = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
  },
});

const PersonToPublications = defineTable({
  columns: {
    publication: column.text({
      references: () => Publications.columns.id,
    }),
    author: column.text({
      references: () => Person.columns.id,
    }),
    order: column.number(),
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
    ExperienceItems,
    Education,
    EducationItems,
    Scholarships,
    Publications,
    Person,
    PersonToPublications,
  },
});
