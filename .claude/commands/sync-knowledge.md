# Regenerate the chat profile

Rebuild the per-locale profile that the homepage chat and the MCP server answer from, after content in `src/content/` changed.

## Pipeline

Execute these steps in order. Stop and report if any step fails.

### Step 1: Check AI model configuration

Read `src/config/ai.ts` and check whether the model IDs in `DevModelAPIAlias` and `ProdModelAPIAlias` are still current. Look the latest model list up (the `claude-api` skill, or WebSearch on `docs.anthropic.com`); model IDs get deprecated, so verify rather than recall.

If a model is from an older generation than the current one in its family, tell the user and propose the update; change it only after they confirm. Keep `DevModelName` and `ProdModelName` in step with any model change.

### Step 2: Regenerate the profile

```bash
pnpm exec tsx src/scripts/generate-knowledge.ts
```

This reads every `src/content/` collection and writes:

- `src/generated/chat-profile/{en,pt,de}.md`: the profile itself (about 13k tokens per locale), bundled into the Worker and sent whole with every chat question;
- `knowledge/*.md`: intermediate files, wiped and rewritten each run. The profile pulls the background FAQs (`faq-*`) and the CV timeline (`cv-timeline-*`) from here.

Report warnings, and `git diff --stat src/generated/chat-profile` so the user sees what changed. The new profile goes live with the next deploy.

### Step 3: Run the Q&A benchmark (optional)

With the dev server running (`pnpm dev`):

```bash
pnpm exec tsx scripts/benchmark-chat.ts
```

It asks the chat a fixed set of common questions and checks the answers for expected phrases. `--retry-failures` re-tests only the previous failures; `--url https://daniellocatelli.com` tests production. Each run calls the Anthropic API.

Target: 100% pass rate. On failures, check whether the profile is missing the fact (fix the content or `processChatProfile()` / `processFAQ()` in `src/scripts/generate-knowledge.ts`) or whether the system prompt in `src/config/ai.ts` needs adjusting.

### Step 4: Report

Summarize:

- Model config status (current, or the proposed update)
- What changed in the profiles
- Benchmark results (if run)
- Any issues encountered
