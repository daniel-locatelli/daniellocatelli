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

import fs from "node:fs";

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
    expectedPhrases: ["Gramazio Kohler", "ETH Zurich", "Doctoral Researcher"],
    category: "Current Status",
  },
  {
    question: "Are you working right now?",
    expectedPhrases: ["Gramazio Kohler", "ETH Zurich"],
    category: "Current Status",
  },
  {
    question: "What is your current role?",
    expectedPhrases: ["Doctoral Researcher", "Gramazio Kohler"],
    category: "Current Status",
  },
  {
    question: "What do you do?",
    expectedPhrases: ["doctoral researcher", "computational design", "software engineer"],
    forbiddenPhrases: ["I don't have information"],
    category: "Current Status",
  },
  {
    question: "Where do you work?",
    expectedPhrases: ["Gramazio Kohler", "ETH Zurich"],
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
    expectedPhrases: ["Zurich", "Switzerland"],
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
    expectedPhrases: ["Germany", "computational", "software"],
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
    forbiddenPhrases: ["yes, I worked at Google", "my time at Google", "position at Google"],
    category: "Boundary",
  },
  {
    question: "What is your PhD about?",
    expectedPhrases: ["timber", "Gramazio Kohler"],
    forbiddenPhrases: ["I don't have information"],
    category: "Research",
  },

  // ── Portuguese ──
  {
    question: "Voce esta trabalhando atualmente?",
    expectedPhrases: ["Doutorando", "Pesquisador", "ETH", "Gramazio Kohler"],
    category: "Portuguese",
  },

  // ── German ──
  {
    question: "Arbeitest du gerade?",
    expectedPhrases: ["Doktorand", "ETH Zürich", "Gramazio Kohler"],
    category: "German",
  },
];

// ── Runner ──────────────────────────────────────────────────────────────────

const RESULTS_FILE = "scripts/benchmark-results.json";

const BASE_URL = process.argv.includes("--url")
  ? process.argv[process.argv.indexOf("--url") + 1]
  : "http://localhost:4321";

/** When --retry-failures is passed, only re-test previously failed questions */
const retryFailuresOnly = process.argv.includes("--retry-failures");

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

function loadPreviousResults(): Map<string, boolean> {
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

function saveResults(results: Map<string, boolean>) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(Object.fromEntries(results), null, 2));
}

async function main() {
  const previousResults = retryFailuresOnly ? loadPreviousResults() : new Map<string, boolean>();

  console.log(`\nRAG Benchmark - Testing against ${BASE_URL}/api/ai`);
  if (retryFailuresOnly) console.log("(--retry-failures: only re-testing previously failed questions)");
  console.log("=".repeat(70));

  let totalPass = 0;
  let totalFail = 0;
  let skipped = 0;
  const results = new Map<string, boolean>(previousResults);
  const failures: { question: string; category: string; answer: string; missing: string[]; forbidden: string[] }[] = [];

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];

    // Skip previously passed tests when --retry-failures is set
    if (retryFailuresOnly && previousResults.get(tc.question) === true) {
      console.log(`[${i + 1}/${TEST_CASES.length}] ${tc.category}: "${tc.question}" ... SKIP (passed before)`);
      totalPass++;
      skipped++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${TEST_CASES.length}] ${tc.category}: "${tc.question}" ... `);

    const answer = await askQuestion(tc.question);
    const result = checkAnswer(answer, tc.expectedPhrases, tc.forbiddenPhrases);

    if (result.pass) {
      console.log("PASS");
      totalPass++;
      results.set(tc.question, true);
    } else {
      console.log("FAIL");
      totalFail++;
      results.set(tc.question, false);
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

  // Save results for next run
  saveResults(results);

  // ── Report ──
  console.log("\n" + "=".repeat(70));
  console.log(`RESULTS: ${totalPass} passed, ${totalFail} failed out of ${TEST_CASES.length} tests${skipped > 0 ? ` (${skipped} skipped)` : ""}`);
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
