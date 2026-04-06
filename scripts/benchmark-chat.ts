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
