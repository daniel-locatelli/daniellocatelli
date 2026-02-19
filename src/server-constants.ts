const getEnv = (key: string) => {
  let value = "";
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    if (import.meta.env[key]) {
      // @ts-ignore
      value = import.meta.env[key];
    } else if (import.meta.env[`VITE_${key}`]) {
      // @ts-ignore
      value = import.meta.env[`VITE_${key}`];
    }
  }

  if (!value) {
    value = process.env[key] || process.env[`VITE_${key}`] || "";
  }

  if (key === "NOTION_API_SECRET" && !value) {
    console.error(
      `[ERROR] NOTION_API_SECRET is missing. Checked key='${key}' and 'VITE_${key}' in import.meta.env and process.env`,
    );
  }

  return value;
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
