// Helper to safely get env vars in both Vite and Node contexts
const getEnv = (key: string) => {
  // @ts-ignore
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env[key]
  ) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return process.env[key] || process.env[`VITE_${key}`] || "";
};

export const NOTION_API_SECRET = getEnv("NOTION_API_SECRET");
export const DATABASE_ID = getEnv("DATABASE_ID");
export const PEOPLE_DB_ID = getEnv("PEOPLE_DB_ID");

export const CUSTOM_DOMAIN = getEnv("CUSTOM_DOMAIN") || "daniellocatelli.com";
export const BASE_PATH = getEnv("BASE_PATH");

export const REQUEST_TIMEOUT_MS = parseInt(
  getEnv("REQUEST_TIMEOUT_MS") || "20000",
  10,
);
