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

It wipes the knowledge directory first. Report the total count and any warnings.

### Step 3: Sync to Supabase

First do a dry run:

```bash
source .env 2>/dev/null && export SUPABASE_URL SUPABASE_ANON_KEY && npx tsx scripts/sync-knowledge.ts
```

Report the entry count and type/locale breakdown to the user.

Then apply:

```bash
source .env 2>/dev/null && export SUPABASE_URL SUPABASE_ANON_KEY && npx tsx scripts/sync-knowledge.ts --apply
```

This deletes all existing rows in `knowledge_entries` and re-inserts every entry with a fresh embedding via the Supabase `embed` edge function (Voyage-4 model, 1024 dimensions). Takes ~5 minutes for ~350 entries across 3 locales (en, pt, de).

### Step 4: Report

Summarize:
- Model config status (current or updated)
- Number of knowledge files generated
- Number of entries synced to Supabase (succeeded / failed)
- Any issues encountered
