import { column, defineDb, defineTable } from "astro:db";

const Summary = defineTable({
  columns: {
    text: column.text(),
    locale: column.text(),
  },
});

const SkillProgramming = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
  },
});

const SkillProgrammingTranslations = defineTable({
  columns: {
    skillId: column.text({ references: () => SkillProgramming.columns.id }),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillFrameworks = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
  },
});

const SkillFrameworksTranslations = defineTable({
  columns: {
    skillId: column.text({ references: () => SkillFrameworks.columns.id }),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillDatabases = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
  },
});

const SkillDatabasesTranslations = defineTable({
  columns: {
    skillId: column.text({ references: () => SkillDatabases.columns.id }),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillDesign = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
  },
});

const SkillDesignTranslations = defineTable({
  columns: {
    skillId: column.text({ references: () => SkillDesign.columns.id }),
    level: column.text(),
    locale: column.text(),
  },
});

const SkillSpecialized = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
  },
});

const SkillSpecializedTranslations = defineTable({
  columns: {
    skillId: column.number({
      references: () => SkillSpecialized.columns.id,
    }),
    locale: column.text(),
    title: column.text(),
    description: column.text({ optional: true }),
  },
});

const Experience = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    link: column.text(),
  },
});

const ExperienceTranslations = defineTable({
  columns: {
    experienceId: column.text({
      references: () => Experience.columns.id,
    }),
    locale: column.text(),
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
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    link: column.text(),
  },
});

const EducatonTranslations = defineTable({
  columns: {
    educationId: column.text({
      references: () => Education.columns.id,
    }),
    locale: column.text(),
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
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    link: column.text(),
  },
});

const ScholarshipsTranslations = defineTable({
  columns: {
    scholarshipId: column.text({
      references: () => Scholarships.columns.id,
    }),
    locale: column.text(),
    title: column.text(),
    institution: column.text(),
    location: column.text({ optional: true }),
    description: column.text(),
  },
});

const Publications = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    date: column.date(),
    link: column.text(),
  },
});

const PublicationsTranslations = defineTable({
  columns: {
    publicationId: column.text({
      references: () => Publications.columns.id,
    }),
    locale: column.text(),
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
    date: column.date(),
    validUntil: column.date({ optional: true }),
    credentialId: column.text({ optional: true }),
    link: column.text({ optional: true }),
  },
});

const CertificationsTranslations = defineTable({
  columns: {
    certificationId: column.text({
      references: () => Certifications.columns.id,
    }),
    locale: column.text(),
    title: column.text(),
    issuer: column.text(),
    skills: column.text({ optional: true }),
  },
});

const Tutoring = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    link: column.text({ optional: true }),
  },
});

const TutoringTranslations = defineTable({
  columns: {
    tutoringId: column.text({
      references: () => Tutoring.columns.id,
    }),
    locale: column.text(),
    title: column.text(),
    organization: column.text(),
    description: column.text(),
    location: column.text(),
  },
});

const TalksAndLectures = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    date: column.date(),
    link: column.text({ optional: true }),
  },
});

const TalksAndLecturesTranslations = defineTable({
  columns: {
    talkId: column.text({
      references: () => TalksAndLectures.columns.id,
    }),
    locale: column.text(),
    title: column.text(),
    organization: column.text(),
    location: column.text(),
  },
});

const CoursesAttended = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    instructor: column.text(),
    link: column.text({ optional: true }),
  },
});

const CoursesAttendedTranslations = defineTable({
  columns: {
    courseId: column.text({
      references: () => CoursesAttended.columns.id,
    }),
    locale: column.text(),
    title: column.text(),
    organization: column.text(),
    location: column.text(),
  },
});

const Works = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    startDate: column.date(),
    endDate: column.date({ optional: true }),
    link: column.text({ optional: true }),
  },
});

const WorksTranslations = defineTable({
  columns: {
    workId: column.text({
      references: () => Works.columns.id,
    }),
    locale: column.text(),
    company: column.text(),
    title: column.text(),
    location: column.text(),
    description: column.text({ optional: true }),
    category: column.text({ optional: true }),
    note: column.text({ optional: true }),
    link: column.text({ optional: true }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Summary,
    SkillProgramming,
    SkillProgrammingTranslations,
    SkillFrameworks,
    SkillFrameworksTranslations,
    SkillDatabases,
    SkillDatabasesTranslations,
    SkillDesign,
    SkillDesignTranslations,
    SkillSpecialized,
    SkillSpecializedTranslations,
    Experience,
    ExperienceTranslations,
    ExperienceItems,
    Education,
    EducatonTranslations,
    EducationItems,
    Scholarships,
    ScholarshipsTranslations,
    Publications,
    PublicationsTranslations,
    Person,
    PersonToPublications,
    Certifications,
    CertificationsTranslations,
    Tutoring,
    TutoringTranslations,
    TalksAndLectures,
    TalksAndLecturesTranslations,
    CoursesAttended,
    CoursesAttendedTranslations,
    Works,
    WorksTranslations,
  },
});
