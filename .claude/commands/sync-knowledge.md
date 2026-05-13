# Sync Knowledge to Supabase

Regenerate the AI chat knowledge base from content collections and upload to Supabase with fresh vector embeddings.

## Pipeline

Execute these steps in order. Stop and report if any step fails.

### Step 1: Check AI model configuration

Read `src/config/ai.ts` and check whether the model IDs in `DevModelAPIAlias` and `ProdModelAPIAlias` are still current. Use Context7 (`/websites/platform_claude_en_api`, query "available Claude model IDs") or WebSearch on `docs.anthropic.com` to get the latest model list. Do NOT rely on hardcoded IDs — models get deprecated.

If any model uses an older generation (e.g. `claude-sonnet-4-5-*` when `4-6` exists), tell the user and propose the update. Do NOT auto-update without confirmation. Also update `DevModelName` and `ProdModelName` display strings if the model changed.

### Step 2: Generate knowledge files from content

```bash
npx tsx src/scripts/generate-knowledge.ts
```

This reads all `src/content/` collections and generates `knowledge/*.md` files including:
- Individual content pages (projects, research, teaching, publications)
- Individual CV entries (experiences, education, certifications, scholarships, courses-attended)
- A flat chronological CV timeline (always injected as core context by the AI endpoint)
- Aggregated CV sections per category
- Homepage
- **FAQ synthesis chunks** (10 topics x 3 locales = 30 files) that pre-answer common visitor questions in natural language (current employment status, professional overview, education, skills, languages, location/contact, research, teaching, work history, personal background). These bridge the semantic gap between user questions and structured data for better vector retrieval.

It wipes the knowledge directory first. Report the total count and any warnings.

### Step 3: Sync to Supabase

Sync uses the **service_role key** (server-only secret in `.env`, never deployed to Cloudflare) so it can delete and insert under tight RLS. Anon is read-only on `knowledge_entries`.

First do a dry run:

```bash
source .env 2>/dev/null && export SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY && npx tsx scripts/sync-knowledge.ts
```

Report the entry count and type/locale breakdown to the user.

Then apply:

```bash
source .env 2>/dev/null && export SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY && npx tsx scripts/sync-knowledge.ts --apply
```

This deletes all existing rows in `knowledge_entries` and re-inserts every entry with a fresh embedding via the Supabase `embed` edge function (Voyage AI, 1024 dimensions). Takes ~7-10 minutes for ~450 entries across 3 locales (en, pt, de).

### Step 4: Run Q&A benchmark (optional)

If the dev server is running (`npm run dev`), run the benchmark to verify chat quality:

```bash
source .env 2>/dev/null && export SUPABASE_URL SUPABASE_ANON_KEY && npx tsx scripts/benchmark-chat.ts
```

This tests ~26 common questions against the chat API and checks for expected phrases in answers. Use `--retry-failures` to only re-test previously failed questions. Use `--url https://daniellocatelli.com` to test against production.

Target: 100% pass rate. If failures occur, check whether FAQ content in `processFAQ()` (in `src/scripts/generate-knowledge.ts`) needs updating, or if the system prompt in `src/config/ai.ts` needs adjusting.

### Step 5: Report

Summarize:
- Model config status (current or updated)
- Number of knowledge files generated (including FAQ count)
- Number of entries synced to Supabase (succeeded / failed)
- Benchmark results (if run)
- Any issues encountered
