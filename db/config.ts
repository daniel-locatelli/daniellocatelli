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
    startDate: column.date(),
    endDate: column.date(),
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
    startDate: column.date(),
    endDate: column.date(),
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
    startDate: column.date(),
    endDate: column.date(),
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
    publicationId: column.text({
      references: () => Publications.columns.id,
    }),
    personId: column.text({
      references: () => Person.columns.id,
    }),
    order: column.number(),
  },
});

const Certifications = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    date: column.date(),
    title: column.text(),
    issuer: column.text(),
    location: column.text({ optional: true }),
    validUntil: column.date({ optional: true }),
    credentialId: column.text({ optional: true }),
    skills: column.text({ optional: true }),
  },
});

const Tutoring = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    title: column.text(),
    organization: column.text(),
    location: column.text(),
    description: column.text({ optional: true }),
  },
});

const TalksAndLectures = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    date: column.date(),
    title: column.text(),
    organization: column.text(),
    location: column.text(),
  },
});

const CoursesAttended = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    locale: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    title: column.text(),
    organization: column.text(),
    location: column.text(),
    instructor: column.text(),
  },
});

export const FreelanceWorks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    locale: column.text(),
    title: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    description: column.text(),
    location: column.text({ optional: true }),
  },
});

export const BuildSystemsWorks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    locale: column.text(),
    title: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    category: column.text(),
    type: column.text(),
    description: column.text(),
  },
});

export const ArtEngineeringWorks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    locale: column.text(),
    title: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    category: column.text(),
    location: column.text({ optional: true }),
    description: column.text(),
  },
});

export const AlfredReinWorks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    locale: column.text(),
    title: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    category: column.text(),
    location: column.text({ optional: true }),
    description: column.text(),
  },
});

export const IcdItkeWorks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    locale: column.text(),
    title: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    category: column.text(),
    type: column.text(),
    location: column.text({ optional: true }),
    description: column.text(),
  },
});

export const MarkoBraiovicWorks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    locale: column.text(),
    title: column.text(),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    category: column.text(),
    location: column.text({ optional: true }),
    description: column.text(),
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
    Certifications,
    Tutoring,
    TalksAndLectures,
    CoursesAttended,
    FreelanceWorks,
    BuildSystemsWorks,
    ArtEngineeringWorks,
    AlfredReinWorks,
    IcdItkeWorks,
    MarkoBraiovicWorks,
  },
});
