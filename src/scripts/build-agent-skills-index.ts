/**
 * Regenerate public/.well-known/agent-skills/index.json from the SKILL.md
 * files in that directory. Reads name/description from each file's YAML
 * frontmatter and computes the sha256 digest of the file bytes.
 *
 * Run after editing any SKILL.md:  pnpm exec tsx src/scripts/build-agent-skills-index.ts
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "public", ".well-known", "agent-skills");
const SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

function frontmatterField(md: string, key: string): string {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error("missing frontmatter");
  const line = m[1].split(/\r?\n/).find((l) => l.startsWith(`${key}:`));
  if (!line) throw new Error(`missing frontmatter field ${key}`);
  return line.slice(key.length + 1).trim();
}

const skills = readdirSync(ROOT)
  .filter((d) => statSync(join(ROOT, d)).isDirectory())
  .sort()
  .map((dir) => {
    const buf = readFileSync(join(ROOT, dir, "SKILL.md"));
    const md = buf.toString("utf8");
    const name = frontmatterField(md, "name");
    if (name !== dir)
      throw new Error(`skill name "${name}" does not match folder "${dir}"`);
    return {
      name,
      type: "skill-md",
      description: frontmatterField(md, "description"),
      url: `/.well-known/agent-skills/${dir}/SKILL.md`,
      digest: `sha256:${createHash("sha256").update(buf).digest("hex")}`,
    };
  });

writeFileSync(
  join(ROOT, "index.json"),
  JSON.stringify({ $schema: SCHEMA, skills }, null, 2) + "\n",
);
console.log(`Wrote index.json with ${skills.length} skills`);
