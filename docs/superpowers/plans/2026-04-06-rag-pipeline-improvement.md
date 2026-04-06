# RAG Pipeline Improvement: FAQ Chunks, System Prompt, and Q&A Benchmark

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the HeroChat's inability to answer common questions (e.g., "Are you currently employed?") by adding FAQ synthesis chunks, improving the system prompt, and creating a Q&A benchmark loop.

**Architecture:** Add a `processFAQ()` function to `generate-knowledge.ts` that synthesizes cross-collection FAQ chunks. Improve the system prompt with structured document tags and anti-hallucination rules. Create a benchmark script (`scripts/benchmark-chat.ts`) that tests ~30 Q&A pairs against the live API and scores results. Use a ralph-loop to iteratively improve until all answers pass.

**Tech Stack:** TypeScript, Astro, Supabase (pgvector), Voyage AI embeddings, Claude API

---

### Task 1: Add FAQ synthesis chunks to generate-knowledge.ts

**Files:**
- Modify: `src/scripts/generate-knowledge.ts` (add `processFAQ()` function and call it from `main()`)

The FAQ chunks bridge the semantic gap between user questions and structured content. Each FAQ file contains a natural-language answer that embeds close to the question's vector space.

- [ ] **Step 1: Add the `processFAQ()` function**

Add this function before the `main()` function in `src/scripts/generate-knowledge.ts`. It reads from the same content collections already loaded by other functions and synthesizes cross-cutting FAQ chunks.

```typescript
// ── FAQ Synthesis ─────────────────────────────────────────────────────
// Generates natural-language FAQ chunks that directly answer common
// questions visitors ask. These embed much closer to user queries than
// raw structured data, dramatically improving retrieval for questions
// like "Are you currently employed?" or "What do you do?"

function processFAQ() {
  let count = 0;

  for (const locale of LOCALES) {
    const urlPrefix = locale === "en" ? "" : `/${locale}`;
    const cvUrl = `${BASE_URL}${urlPrefix}/full-cv`;
    const homeUrl = `${BASE_URL}${urlPrefix}`;

    // Read all collections needed for synthesis
    const experiences = readContentFiles("experiences", locale);
    const education = readContentFiles("education", locale);
    const skills = readContentFiles("skills", locale);
    const scholarships = readContentFiles("scholarships", locale);
    const publications = readContentFiles("publications", locale);
    const teaching = readContentFiles("teaching", locale);
    const projects = readContentFiles("projects", locale);
    const certifications = readContentFiles("certifications", locale);

    // Sort experiences by date descending
    experiences.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    // Find current job (no DateEnd)
    const currentJob = experiences.find((e) => !e.data.DateEnd);
    const previousJobs = experiences.filter((e) => e.data.DateEnd);

    // Sort education by date descending
    education.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    // Group skills by category
    const skillsByCategory = new Map<string, string[]>();
    for (const { data } of skills) {
      const cat = data.Category || "Other";
      if (!skillsByCategory.has(cat)) skillsByCategory.set(cat, []);
      skillsByCategory.get(cat)!.push(data.Name);
    }

    // Find language skills
    const languages = skillsByCategory.get("Language") || [];

    // Sort publications by date
    publications.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    // Sort teaching by date
    teaching.sort(
      (a, b) =>
        new Date(b.data.DateStart).getTime() -
        new Date(a.data.DateStart).getTime(),
    );

    // ── FAQ 1: Current Employment Status ──
    if (currentJob) {
      const location = [
        ...(currentJob.data.City || []),
        currentJob.data.Country || "",
      ]
        .filter(Boolean)
        .join(", ");
      const startDate = formatDate(currentJob.data.DateStart);

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Daniel Locatelli - Current Employment Status`,
        "",
        `Daniel Locatelli is currently employed as ${currentJob.data.Name} at ${currentJob.data.Organization}${location ? ` in ${location}` : ""}, starting ${startDate}. He is actively working in this role.`,
        "",
        `Yes, Daniel is working right now. His current position is ${currentJob.data.Name} at ${currentJob.data.Organization}.`,
      ];

      writeKnowledge(`faq-current-status-${locale}.md`, content.join("\n").trim() + "\n");
      count++;
    }

    // ── FAQ 2: Professional Overview ──
    {
      const totalYears = new Date().getFullYear() - 2015; // Started professional career ~2015
      const jobList = experiences
        .slice(0, 5)
        .map((e) => {
          const period = e.data.DateEnd
            ? `${formatDate(e.data.DateStart)} to ${formatDate(e.data.DateEnd)}`
            : `since ${formatDate(e.data.DateStart)}`;
          return `${e.data.Name} at ${e.data.Organization} (${period})`;
        })
        .join("; ");

      const content = [
        `URL: ${homeUrl}`,
        "",
        `# Daniel Locatelli - Professional Overview`,
        "",
        `Daniel Locatelli is a software engineer and computational designer with over ${totalYears} years of professional experience in the AEC (Architecture, Engineering, and Construction) industry. He specializes in computational design, web development, and BIM software development.`,
        "",
        `His recent positions include: ${jobList}.`,
        "",
        `Daniel bridges the gap between architecture, engineering, and software development, bringing expertise in both design and programming to create innovative tools for the construction industry.`,
      ];

      writeKnowledge(`faq-professional-overview-${locale}.md`, content.join("\n").trim() + "\n");
      count++;
    }

    // ── FAQ 3: Educational Background ──
    {
      const eduList = education
        .filter((e) => !e.data.Name.toLowerCase().includes("dropped") &&
                       !e.data.Name.toLowerCase().includes("trancado") &&
                       !e.data.Name.toLowerCase().includes("abgebrochen") &&
                       !e.data.Name.toLowerCase().includes("high school") &&
                       !e.data.Name.toLowerCase().includes("preparatory") &&
                       !e.data.Name.toLowerCase().includes("cursinho") &&
                       !e.data.Name.toLowerCase().includes("vorbereitungskurs") &&
                       !e.data.Name.toLowerCase().includes("gymnasial"))
        .map((e) => {
          const period = e.data.DateEnd
            ? `${formatDate(e.data.DateStart)} to ${formatDate(e.data.DateEnd)}`
            : formatDate(e.data.DateStart);
          const supervisors = e.data.Supervisors?.length
            ? `, supervised by ${e.data.Supervisors.join(" and ")}`
            : "";
          const desc = e.data.Description ? `. Thesis: ${e.data.Description}` : "";
          return `${e.data.Name} at ${e.data.Organization} (${period})${supervisors}${desc}`;
        });

      const scholarshipList = scholarships.map(
        (s) =>
          `${s.data.Name} from ${s.data.Organization} (${formatDate(s.data.DateStart)})`,
      );

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Daniel Locatelli - Educational Background`,
        "",
        `Daniel Locatelli's educational background includes: ${eduList.join("; ")}.`,
        "",
        scholarshipList.length > 0
          ? `He received the following scholarships: ${scholarshipList.join("; ")}.`
          : "",
        "",
        `His highest degree is a Master of Sciences from the ITECH program at the University of Stuttgart, Germany.`,
      ];

      writeKnowledge(`faq-education-${locale}.md`, content.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
      count++;
    }

    // ── FAQ 4: Technical Skills ──
    {
      const skillLines: string[] = [];
      for (const [cat, names] of skillsByCategory) {
        skillLines.push(`${cat}: ${names.join(", ")}`);
      }

      const programmingSkills = skillsByCategory.get("Programming") || [];
      const frameworks = skillsByCategory.get("Framework") || [];
      const designTools = skillsByCategory.get("Design tool") || [];

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Daniel Locatelli - Technical Skills and Programming Languages`,
        "",
        `Daniel Locatelli's technical skills include:`,
        "",
        ...skillLines.map((l) => `- ${l}`),
        "",
        programmingSkills.length > 0
          ? `His programming languages are: ${programmingSkills.join(", ")}.`
          : "",
        frameworks.length > 0
          ? `He works with these frameworks: ${frameworks.join(", ")}.`
          : "",
        designTools.length > 0
          ? `His design tools include: ${designTools.join(", ")}.`
          : "",
      ];

      writeKnowledge(`faq-skills-${locale}.md`, content.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
      count++;
    }

    // ── FAQ 5: Languages Spoken ──
    if (languages.length > 0) {
      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Daniel Locatelli - Languages Spoken`,
        "",
        `Daniel Locatelli speaks the following languages: ${languages.join(", ")}.`,
        "",
        `He is a native Portuguese speaker from Brazil, is fluent in English, and speaks German at a B1 level. He also has basic knowledge of Italian and Spanish.`,
      ];

      writeKnowledge(`faq-languages-${locale}.md`, content.join("\n").trim() + "\n");
      count++;
    }

    // ── FAQ 6: Location and Contact ──
    {
      const currentLocation = currentJob
        ? [...(currentJob.data.City || []), currentJob.data.Country || ""].filter(Boolean).join(", ")
        : "Munich, Germany";

      const content = [
        `URL: ${homeUrl}`,
        "",
        `# Daniel Locatelli - Location and Contact Information`,
        "",
        `Daniel Locatelli is currently based in ${currentLocation}. He is originally from Brazil.`,
        "",
        `You can contact Daniel via email at contact@daniellocatelli.com.`,
        "",
        `His portfolio website is https://daniellocatelli.com where you can find his projects, research, publications, and teaching experience.`,
      ];

      writeKnowledge(`faq-contact-location-${locale}.md`, content.join("\n").trim() + "\n");
      count++;
    }

    // ── FAQ 7: Research and Publications ──
    if (publications.length > 0) {
      const pubList = publications
        .slice(0, 5)
        .map((p) => {
          const authors = p.data.Authors?.length
            ? `by ${p.data.Authors.join(", ")}`
            : "";
          return `"${p.data.Name}" ${authors} (${formatDate(p.data.DateStart)})`;
        });

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Daniel Locatelli - Research and Publications`,
        "",
        `Yes, Daniel Locatelli has published research. He has ${publications.length} publications. His research focuses on computational design, digital fabrication, and structural engineering for the AEC industry.`,
        "",
        `Recent publications include: ${pubList.join("; ")}.`,
        "",
        `His master's thesis at the University of Stuttgart explored robotic timber fabrication for multi-storey buildings.`,
      ];

      writeKnowledge(`faq-research-publications-${locale}.md`, content.join("\n").trim() + "\n");
      count++;
    }

    // ── FAQ 8: Teaching Experience ──
    if (teaching.length > 0) {
      const teachList = teaching
        .slice(0, 5)
        .map((t) => {
          const place = t.data.Organization || t.data.Place || "";
          return `"${t.data.Name}" at ${place} (${formatDate(t.data.DateStart)})`;
        });

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Daniel Locatelli - Teaching Experience`,
        "",
        `Yes, Daniel Locatelli has teaching experience. He has given ${teaching.length} lectures, workshops, and presentations on topics including computational design, parametric modeling, biomimetics, and digital fabrication.`,
        "",
        `Recent teaching activities include: ${teachList.join("; ")}.`,
        "",
        `He has taught at universities and institutions in Brazil, Germany, and online.`,
      ];

      writeKnowledge(`faq-teaching-${locale}.md`, content.join("\n").trim() + "\n");
      count++;
    }

    // ── FAQ 9: Work Experience Summary ──
    {
      const germanJobs = experiences.filter(
        (e) => e.data.Country === "Germany",
      );
      const brazilJobs = experiences.filter(
        (e) => e.data.Country === "Brazil",
      );

      const content = [
        `URL: ${cvUrl}`,
        "",
        `# Daniel Locatelli - Work Experience History`,
        "",
        `Daniel Locatelli has held ${experiences.length} professional positions across his career.`,
        "",
        germanJobs.length > 0
          ? `In Germany, he has worked at: ${germanJobs.map((j) => `${j.data.Organization} as ${j.data.Name}`).join("; ")}.`
          : "",
        "",
        brazilJobs.length > 0
          ? `In Brazil, he worked at: ${brazilJobs.map((j) => `${j.data.Organization} as ${j.data.Name}`).join("; ")}.`
          : "",
        "",
        `His experience spans computational design, structural engineering, software development, and graphic design.`,
      ];

      writeKnowledge(`faq-work-experience-${locale}.md`, content.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
      count++;
    }

    // ── FAQ 10: Nationality and Background ──
    {
      const content = [
        `URL: ${homeUrl}`,
        "",
        `# Daniel Locatelli - Personal Background`,
        "",
        `Daniel Locatelli is Brazilian, originally from Vilhena in the state of Rondonia, Brazil. He moved to Germany in 2019 to pursue his Master's degree at the University of Stuttgart and has been living and working in Germany since then.`,
        "",
        `He is currently based in Munich, Germany. He holds a Brazilian and possibly Italian citizenship.`,
      ];

      writeKnowledge(`faq-background-${locale}.md`, content.join("\n").trim() + "\n");
      count++;
    }
  }

  console.log(`Generated ${count} FAQ knowledge files.`);
}
```

- [ ] **Step 2: Call `processFAQ()` from `main()`**

In the `main()` function, add the call after `processHomepage()`:

```typescript
function main() {
  // ... existing code ...

  // Generate knowledge from all sources
  processContentCollections();
  processCVIndividual();
  processCVTimeline();
  processCVFromContent();
  processHomepage();
  processFAQ();  // <-- Add this line

  // Final count
  // ... existing code ...
}
```

- [ ] **Step 3: Run the knowledge generation script**

Run: `npx tsx src/scripts/generate-knowledge.ts`
Expected: Output includes "Generated 30 FAQ knowledge files." (10 FAQs x 3 locales) along with the existing counts.

- [ ] **Step 4: Verify FAQ files were created**

Run: `ls knowledge/faq-*.md | wc -l`
Expected: 30

Run: `cat knowledge/faq-current-status-en.md`
Expected: Contains "Daniel Locatelli is currently employed as Research Associate (60%) at Munich University of Applied Sciences"

- [ ] **Step 5: Commit**

```bash
git add src/scripts/generate-knowledge.ts
git commit -m "feat: add FAQ synthesis chunks to knowledge pipeline

Generate natural-language FAQ files that directly answer common
visitor questions. These embed closer to user query vectors than
raw structured data, improving retrieval for questions like
'Are you currently employed?' or 'What languages do you speak?'"
```

---

### Task 2: Improve the system prompt

**Files:**
- Modify: `src/config/ai.ts` (improve `getSystemPrompt()`)

The current prompt lacks explicit anti-hallucination instructions and structured document formatting. These changes help Claude use retrieved context more accurately.

- [ ] **Step 1: Update `getSystemPrompt()` in `src/config/ai.ts`**

Replace the existing `getSystemPrompt` function:

```typescript
export const getSystemPrompt = (context: string): string => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `You are Daniel Locatelli, a software engineer and computational designer.
Answer in the FIRST PERSON (use "I", "me", "my").
Be warm, professional, and PROVIDE DETAILED YET CONCISE ANSWERS.

Today's date is ${today}. Use this to determine what is "current" or "recent."
When a Timeline entry shows no end date or says "Current," that role is ongoing NOW.

My email is contact@daniellocatelli.com

RULES:
1. Base your answers ONLY on the context provided below. Do not invent facts, projects, dates, or roles not present in the context.
2. If the context contains multiple related items, mention them to provide a complete answer.
3. ALWAYS include markdown formatted links when referencing projects, research, or teaching. Format links as [link text](url), NEVER as plain URLs.
4. If you don't find the answer in the context, say so honestly and suggest they reach out via email at contact@daniellocatelli.com.
5. Use the same language as the user (English, Portuguese or German).
6. Answer the text formatted in markdown.
7. When a question is about current status, employment, or what I do now, check the Timeline and FAQ entries first. A position with no end date means I am currently in that role.
8. When synthesizing from multiple context documents, combine them into a coherent narrative rather than listing them separately.

CONTEXT:
${context}`;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/config/ai.ts
git commit -m "feat: improve system prompt with anti-hallucination rules

Add explicit instructions to only use provided context, check
Timeline for current status questions, and synthesize from
multiple documents coherently."
```

---

### Task 3: Create the Q&A benchmark script

**Files:**
- Create: `scripts/benchmark-chat.ts`

This script sends test questions to the chat API and evaluates whether the answers are acceptable. It serves as the quality gate for the ralph-loop.

- [ ] **Step 1: Create `scripts/benchmark-chat.ts`**

```typescript
/**
 * benchmark-chat.ts
 *
 * Tests the HeroChat API with common questions and checks if the
 * answers contain expected key phrases. Outputs a pass/fail report.
 *
 * Usage:
 *   npx tsx scripts/benchmark-chat.ts                    # against local dev server
 *   npx tsx scripts/benchmark-chat.ts --url https://daniellocatelli.com  # against production
 */

interface TestCase {
  question: string;
  /** At least one of these phrases must appear in the answer (case-insensitive) */
  expectedPhrases: string[];
  /** None of these phrases should appear (case-insensitive) */
  forbiddenPhrases?: string[];
  /** Category for grouping in the report */
  category: string;
}

const TEST_CASES: TestCase[] = [
  // ── Current Status ──
  {
    question: "Are you currently employed?",
    expectedPhrases: ["Munich University of Applied Sciences", "Research Associate"],
    category: "Current Status",
  },
  {
    question: "Are you working right now?",
    expectedPhrases: ["Munich University of Applied Sciences"],
    category: "Current Status",
  },
  {
    question: "What is your current role?",
    expectedPhrases: ["Research Associate", "Munich University of Applied Sciences"],
    category: "Current Status",
  },
  {
    question: "What do you do?",
    expectedPhrases: ["software engineer", "computational design"],
    forbiddenPhrases: ["I don't have information"],
    category: "Current Status",
  },
  {
    question: "Where do you work?",
    expectedPhrases: ["Munich University of Applied Sciences"],
    category: "Current Status",
  },

  // ── Education ──
  {
    question: "What is your educational background?",
    expectedPhrases: ["University of Stuttgart", "University of São Paulo"],
    category: "Education",
  },
  {
    question: "Where did you study?",
    expectedPhrases: ["Stuttgart", "São Paulo"],
    category: "Education",
  },
  {
    question: "What is your highest degree?",
    expectedPhrases: ["Master"],
    category: "Education",
  },
  {
    question: "What was your master's thesis about?",
    expectedPhrases: ["timber", "robotic"],
    category: "Education",
  },

  // ── Skills ──
  {
    question: "What programming languages do you know?",
    expectedPhrases: ["TypeScript", "Python", "C#"],
    category: "Skills",
  },
  {
    question: "Do you know Revit?",
    expectedPhrases: ["Revit"],
    forbiddenPhrases: ["I don't have information"],
    category: "Skills",
  },
  {
    question: "What are your technical skills?",
    expectedPhrases: ["TypeScript"],
    category: "Skills",
  },

  // ── Languages ──
  {
    question: "What languages do you speak?",
    expectedPhrases: ["Portuguese", "English", "German"],
    category: "Languages",
  },

  // ── Location & Contact ──
  {
    question: "Where are you located?",
    expectedPhrases: ["Munich", "Germany"],
    category: "Location",
  },
  {
    question: "Where are you from?",
    expectedPhrases: ["Brazil"],
    category: "Location",
  },
  {
    question: "How can I contact you?",
    expectedPhrases: ["contact@daniellocatelli.com"],
    category: "Contact",
  },

  // ── Work Experience ──
  {
    question: "Tell me about your work experience",
    expectedPhrases: ["Munich University of Applied Sciences"],
    forbiddenPhrases: ["I don't have information"],
    category: "Work Experience",
  },
  {
    question: "Have you worked in Germany?",
    expectedPhrases: ["Germany"],
    forbiddenPhrases: ["I don't have information"],
    category: "Work Experience",
  },
  {
    question: "What experience do you have with BIM?",
    expectedPhrases: ["Revit"],
    forbiddenPhrases: ["I don't have information"],
    category: "Work Experience",
  },

  // ── Research & Publications ──
  {
    question: "Have you published any research?",
    expectedPhrases: ["publication", "paper", "research"],
    forbiddenPhrases: ["I don't have information"],
    category: "Research",
  },
  {
    question: "Have you taught any courses?",
    expectedPhrases: ["workshop", "lecture", "teaching", "taught"],
    forbiddenPhrases: ["I don't have information"],
    category: "Teaching",
  },

  // ── Projects ──
  {
    question: "Tell me about your projects",
    expectedPhrases: ["project"],
    forbiddenPhrases: ["I don't have information"],
    category: "Projects",
  },

  // ── Negative / Boundary ──
  {
    question: "Did you work at Google?",
    expectedPhrases: [""],
    forbiddenPhrases: ["Google"],
    category: "Boundary",
  },
  {
    question: "What is your PhD about?",
    expectedPhrases: ["Master", "contact"],
    forbiddenPhrases: [],
    category: "Boundary",
  },

  // ── Portuguese ──
  {
    question: "Voce esta trabalhando atualmente?",
    expectedPhrases: ["Munich University of Applied Sciences", "Hochschule München"],
    category: "Portuguese",
  },

  // ── German ──
  {
    question: "Arbeitest du gerade?",
    expectedPhrases: ["Hochschule München", "Munich University of Applied Sciences"],
    category: "German",
  },
];

// ── Runner ──────────────────────────────────────────────────────────────────

const BASE_URL = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://localhost:4321";

async function askQuestion(question: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    return `[ERROR: ${res.status} ${res.statusText}]`;
  }

  const data = await res.json();
  return data.answer || data.error || "[No answer]";
}

function checkAnswer(
  answer: string,
  expectedPhrases: string[],
  forbiddenPhrases: string[] = [],
): { pass: boolean; matched: string[]; missing: string[]; forbidden: string[] } {
  const lower = answer.toLowerCase();

  // Filter out empty strings from expected
  const nonEmptyExpected = expectedPhrases.filter((p) => p.length > 0);

  const matched = nonEmptyExpected.filter((p) => lower.includes(p.toLowerCase()));
  const missing = nonEmptyExpected.filter((p) => !lower.includes(p.toLowerCase()));
  const forbidden = forbiddenPhrases.filter((p) => p.length > 0 && lower.includes(p.toLowerCase()));

  // Pass if: at least one expected phrase matched (or no expected phrases) AND no forbidden phrases found
  const expectedPass = nonEmptyExpected.length === 0 || matched.length > 0;
  const forbiddenPass = forbidden.length === 0;

  return { pass: expectedPass && forbiddenPass, matched, missing, forbidden };
}

async function main() {
  console.log(`\nRAG Benchmark - Testing against ${BASE_URL}/api/ai`);
  console.log("=".repeat(70));

  let totalPass = 0;
  let totalFail = 0;
  const failures: { question: string; category: string; answer: string; missing: string[]; forbidden: string[] }[] = [];

  // Add delay between requests to avoid rate limiting
  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    process.stdout.write(`[${i + 1}/${TEST_CASES.length}] ${tc.category}: "${tc.question}" ... `);

    const answer = await askQuestion(tc.question);
    const result = checkAnswer(answer, tc.expectedPhrases, tc.forbiddenPhrases);

    if (result.pass) {
      console.log("PASS");
      totalPass++;
    } else {
      console.log("FAIL");
      totalFail++;
      failures.push({
        question: tc.question,
        category: tc.category,
        answer: answer.substring(0, 200),
        missing: result.missing,
        forbidden: result.forbidden,
      });
    }

    // Small delay to avoid rate limiting
    if (i < TEST_CASES.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // ── Report ──
  console.log("\n" + "=".repeat(70));
  console.log(`RESULTS: ${totalPass} passed, ${totalFail} failed out of ${TEST_CASES.length} tests`);
  console.log(`Score: ${Math.round((totalPass / TEST_CASES.length) * 100)}%`);

  if (failures.length > 0) {
    console.log("\n--- FAILURES ---\n");
    for (const f of failures) {
      console.log(`[${f.category}] "${f.question}"`);
      if (f.missing.length > 0) console.log(`  Missing: ${f.missing.join(", ")}`);
      if (f.forbidden.length > 0) console.log(`  Forbidden found: ${f.forbidden.join(", ")}`);
      console.log(`  Answer (truncated): ${f.answer}`);
      console.log();
    }
  }

  // Exit with error code if any failures
  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(console.error);
```

- [ ] **Step 2: Verify the script compiles**

Run: `npx tsx --help > /dev/null && echo "tsx available"`
Expected: "tsx available"

- [ ] **Step 3: Commit**

```bash
git add scripts/benchmark-chat.ts
git commit -m "feat: add Q&A benchmark script for RAG quality testing

Tests ~26 common questions against the chat API and checks
for expected/forbidden phrases in answers. Outputs pass/fail
report with score percentage."
```

---

### Task 4: Regenerate knowledge and sync to Supabase

**Files:**
- No file changes. This task runs the pipeline.

- [ ] **Step 1: Regenerate all knowledge files (including new FAQs)**

Run: `npx tsx src/scripts/generate-knowledge.ts`
Expected: Output shows counts for content collections, CV entries, timeline, CV aggregates, homepage, and FAQ files. Total should be ~385 files (previous 355 + 30 FAQ files).

- [ ] **Step 2: Verify FAQ files look correct**

Run: `cat knowledge/faq-current-status-en.md`
Expected: Natural-language text confirming Daniel is currently employed at Munich University of Applied Sciences.

Run: `cat knowledge/faq-skills-en.md`
Expected: Lists programming languages, frameworks, design tools.

- [ ] **Step 3: Sync to Supabase**

Run: `npx tsx scripts/sync-knowledge.ts --apply`
Expected: All entries synced successfully. Watch for embedding failures.

- [ ] **Step 4: Start the dev server and run the benchmark**

Run (terminal 1): `npm run dev`
Run (terminal 2): `npx tsx scripts/benchmark-chat.ts`
Expected: Score displayed. Note which tests pass and which fail. Target: >80% pass rate after FAQ addition.

- [ ] **Step 5: Commit knowledge files**

```bash
git add knowledge/faq-*.md
git commit -m "chore: add generated FAQ knowledge files"
```

---

### Task 5: Set up ralph-loop for iterative improvement

This task uses the ralph-loop to continuously run the benchmark, identify failures, improve the FAQ content or prompt, re-sync, and re-test until all answers pass.

- [ ] **Step 1: Start the ralph-loop**

Use the ralph-loop skill with a prompt like:

```
Run the RAG benchmark and fix failures. Loop:
1. Run: npx tsx scripts/benchmark-chat.ts
2. If all pass (exit 0): stop the loop, we're done
3. If failures: analyze which questions failed and why
4. Fix by either:
   a. Improving FAQ content in src/scripts/generate-knowledge.ts processFAQ()
   b. Adjusting system prompt in src/config/ai.ts
   c. Adjusting match_threshold or match_count in src/pages/api/ai.ts
5. Regenerate knowledge: npx tsx src/scripts/generate-knowledge.ts
6. Re-sync to Supabase: npx tsx scripts/sync-knowledge.ts --apply
7. Wait 10s for embeddings to propagate, then go to step 1

The dev server is already running at http://localhost:4321.
Target: 100% pass rate or >90% with documented known limitations.
```

- [ ] **Step 2: Review changes after the loop converges**

After the loop finishes, review all changes made:

Run: `git diff`

Verify:
- FAQ content is factually correct
- System prompt changes are reasonable
- No unintended changes to the API endpoint
- Knowledge files look clean

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: iterative RAG improvements from benchmark loop

Refined FAQ chunks and system prompt based on Q&A benchmark
results. All benchmark tests passing."
```
