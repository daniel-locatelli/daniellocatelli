// The per-locale profile written by src/scripts/generate-knowledge.ts
// (processChatProfile). The homepage chat sends it to Claude as context, and
// the MCP server searches it and serves it whole.
import profileEn from "../generated/chat-profile/en.md?raw";
import profilePt from "../generated/chat-profile/pt.md?raw";
import profileDe from "../generated/chat-profile/de.md?raw";

export const PROFILES = {
  en: profileEn,
  pt: profilePt,
  de: profileDe,
} as const;

export type ProfileLocale = keyof typeof PROFILES;

/** The profile for `locale`, or the English one for anything else. */
export function profileFor(locale: unknown): string {
  return typeof locale === "string" && Object.hasOwn(PROFILES, locale)
    ? PROFILES[locale as ProfileLocale]
    : PROFILES.en;
}
