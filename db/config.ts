import { column, defineDb, defineTable } from "astro:db";

const SkillProgramming = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    level: column.text(),
  },
});

const SkillFrameworks = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
  },
});

const SkillDatabases = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
  },
});

const SkillDesign = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
  },
});

const SkillSpecialized = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    SkillProgramming,
    SkillFrameworks,
    SkillDatabases,
    SkillDesign,
    SkillSpecialized,
  },
});
