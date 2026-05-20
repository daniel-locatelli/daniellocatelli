export interface LlmsTxtEntry {
  title: string;
  url: string;
  summary?: string;
}

export interface LlmsTxtSection {
  title: string;
  entries: LlmsTxtEntry[];
}

export interface LlmsTxtInput {
  title: string;
  tagline: string;
  sections: LlmsTxtSection[];
}

export function formatLlmsTxt(input: LlmsTxtInput): string {
  const lines: string[] = [];
  lines.push(`# ${input.title}`);
  lines.push(`> ${input.tagline}`);
  for (const section of input.sections) {
    lines.push("");
    lines.push(`## ${section.title}`);
    for (const entry of section.entries) {
      const summary = entry.summary?.trim();
      const link = `- [${entry.title}](${entry.url})`;
      lines.push(summary ? `${link}: ${summary}` : link);
    }
  }
  return lines.map((l) => l.replace(/\s+$/u, "")).join("\n") + "\n";
}
