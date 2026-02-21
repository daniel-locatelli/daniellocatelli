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

  return value;
};

export const CUSTOM_DOMAIN = getEnv("CUSTOM_DOMAIN") || "daniellocatelli.com";
export const BASE_PATH = getEnv("BASE_PATH");

export const REQUEST_TIMEOUT_MS = parseInt(
  getEnv("REQUEST_TIMEOUT_MS") || "20000",
  10,
);
