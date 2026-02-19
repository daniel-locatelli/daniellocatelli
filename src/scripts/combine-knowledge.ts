import fs from "node:fs";
import path from "node:path";

const knowledgeDir = path.join(process.cwd(), "knowledge");
const outputPath = path.join(process.cwd(), "src/lib/knowledge.json");

interface KnowledgeItem {
  url: string;
  content: string;
}

async function main() {
  const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));
  const knowledge: KnowledgeItem[] = [];

  console.log(`Combining ${files.length} files...`);

  for (const file of files) {
    const rawContent = fs.readFileSync(path.join(knowledgeDir, file), "utf-8");

    // Extract Metadata
    let url = "";
    let content = rawContent;

    const urlMatch = content.match(/^URL: (.*)(\r?\n|\r)/);
    if (urlMatch) {
      url = urlMatch[1].trim();
      content = content.replace(urlMatch[0], "");
    }

    // Clean up content
    // Remove excessive newlines (more than 2 -> 2)
    content = content.replace(/(\r?\n){3,}/g, "\n\n").trim();

    knowledge.push({
      url,
      content,
    });
  }

  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(knowledge, null, 2));
  console.log(`Combined knowledge saved to ${outputPath}`);
}

main().catch(console.error);
