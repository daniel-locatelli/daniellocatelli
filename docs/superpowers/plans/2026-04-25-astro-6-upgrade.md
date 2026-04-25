# Astro 6 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the project from Astro 5.15.x to Astro 6.1.x, including the matching `@astrojs/cloudflare` v13 adapter and all peer integrations, with every relevant breaking change addressed.

**Architecture:** Astro 6 + Cloudflare adapter v13 moves the dev server into Cloudflare's `workerd` runtime (parity with production), removes `Astro.locals.runtime`, splits `z` out of `astro:content`, and changes the default Cloudflare image service. The codebase is already on `glob()` content loaders, `<ClientRouter />`, and Workers Static Assets (`assets` binding) - so the surface area touched is small. The previous failed upgrade attempt (commit 5c7c165) failed because `sharp`/`node:fs` were eagerly imported into the SSR graph; that root cause was already fixed in commit ee4d156, so this re-attempt should succeed.

**Tech Stack:** Astro 6, `@astrojs/cloudflare` 13, `@astrojs/mdx` 5, `@astrojs/react` 5, `@astrojs/sitemap` 4, `@astrojs/check` 0.9.8, Vite 7, Zod 4, Cloudflare Workers (Static Assets).

---

## Pre-flight Context (read before executing)

**Why the last attempt failed:** Commit `5c7c165` reverted Astro 6 because workerd surfaced `module is not defined` on every route. The cause was a CommonJS module being eagerly imported into the SSR graph. Commit `ee4d156` fixed the most likely culprit by lazy-loading `sharp` and `node:fs/promises` inside `generateBlurDataUrl` in `src/lib/blog-helpers.ts`. Re-do the upgrade now that the prerequisite landed.

**Current deployment:** Despite README saying "Cloudflare Pages", `wrangler.toml` and `dist/server/wrangler.json` show this is already a **Cloudflare Worker** with Static Assets (binding `ASSETS`). Astro 6 dropping Pages support does not affect this project.

**Node version:** Already on Node v24.12.0, which satisfies Astro 6's `>= 22.12.0` requirement.

**Files that will change:**

- Modify: `package.json` - dep bumps
- Modify: `astro.config.mts` - adapter image service config
- Modify: `wrangler.toml` - new entrypoint, compatibility_date, nodejs_compat flag
- Modify: `src/content.config.ts` - split `z` import
- Modify: `src/pages/api/ai.ts` - migrate `Astro.locals.runtime.env`
- Modify: `README.md` - update Tech Stack table line
- Modify: `CLAUDE.md` - update deployment line

No new files. No file deletions.

---

## Task 1: Baseline & branch hygiene

**Files:** none (git operations only)

- [ ] **Step 1: Confirm working tree is clean except for the known untracked asset**

Run: `git status -s`
Expected output:
```
?? "src/assets/content/research/architecture-biomimicry-algorithm/Brick-laying robot by Fastbrick Robotics.jpg"
```
If anything else appears, stop and resolve before proceeding.

- [ ] **Step 2: Capture a baseline build to compare against**

Run: `npm run build 2>&1 | tee /tmp/build-baseline.log`
Expected: build completes without error on Astro 5. Save the log file path - you'll diff it against the post-upgrade build later.

- [ ] **Step 3: Note the current `astro check` output for parity later**

Run: `npx astro check 2>&1 | tee /tmp/check-baseline.log`
Expected: passes (or shows the same set of errors/warnings the user already lives with). Don't try to fix pre-existing issues during this upgrade.

---

## Task 2: Upgrade dependencies

**Files:**
- Modify: `package.json` (root)

This task uses `npm install` directly rather than `npx @astrojs/upgrade`, because the codebases knows exactly which versions it needs and `@astrojs/upgrade` would silently bump non-Astro deps too.

- [ ] **Step 1: Bump Astro core, all `@astrojs/*` integrations, and the Cloudflare adapter in one install**

Run:
```bash
npm install astro@^6.1.9 \
  @astrojs/cloudflare@^13.2.1 \
  @astrojs/mdx@^5.0.4 \
  @astrojs/react@^5.0.4 \
  @astrojs/sitemap@^4.0.0 \
  @astrojs/check@^0.9.8
```

If npm reports peer dep conflicts that cannot auto-resolve, re-run with `--legacy-peer-deps` only as a last resort and record the warning in the commit message.

Notes:
- `wrangler` is already at `^4.83.0` (the floor required by `@astrojs/cloudflare@13.2.x`), so it does not need to be re-installed - leave it alone.
- `@astrojs/check` does not have a 0.10 line yet. 0.9.8 supports both Astro 5 and Astro 6 since it just wraps `@astrojs/language-server` + `tsc`.

- [ ] **Step 2: Verify the resolved versions**

Run: `npm ls astro @astrojs/cloudflare @astrojs/mdx @astrojs/react @astrojs/sitemap @astrojs/check --depth=0`

Expected: every package on its `6.x` / `13.x` / `5.x` / `4.x` / `0.9.x` line respectively. If any package resolved to a lower major (e.g. `@astrojs/mdx@4.x`), figure out which peer pinned it and adjust before continuing.

- [ ] **Step 3: Verify Vite 7 is now the resolved bundler**

Run: `npm ls vite --depth=2 | head -20`

Expected: `vite@^7` appears as a transitive dep of `astro`. If still on Vite 6, the Astro upgrade did not actually take effect.

- [ ] **Step 4: Do not commit yet**

The codebase will not build at this point because of the breaking changes. Continue to Task 3.

---

## Task 3: Migrate `z` import in content config

**Files:**
- Modify: `src/content.config.ts:1`

Astro 6 removed `z` from `astro:content`. Import it separately from `astro/zod` (which re-exports Zod 4).

- [ ] **Step 1: Edit `src/content.config.ts` to split the `z` import**

Replace:
```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
```

With:
```ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
```

- [ ] **Step 2: Verify there are no other `z` re-imports from `astro:content`**

Run grep to be sure:
```bash
```
Use the Grep tool with pattern `from\s+["']astro:content["']` across `src/`. Confirm that `src/content.config.ts` is the only file that imported `z` from `astro:content`. (At time of plan writing it was - but verify, because new files may have been added.)

- [ ] **Step 3: Run `astro sync` to confirm the schema still resolves**

Run: `npx astro sync`
Expected: completes without throwing. If you see "Cannot find module 'astro/zod'", the Astro upgrade in Task 2 did not land - go back and check `npm ls astro`.

---

## Task 4: Migrate `Astro.locals.runtime.env` to `cloudflare:workers` env import

**Files:**
- Modify: `src/pages/api/ai.ts:65`

Astro 6 + Cloudflare v13 removed `Astro.locals.runtime`. Bindings must now be read via the `env` import from `cloudflare:workers`, which is a workerd-provided global module.

- [ ] **Step 1: Add the `cloudflare:workers` import at the top of `src/pages/api/ai.ts`**

Add this import directly after the existing `import` block (after the `getSystemPrompt` import):

```ts
import { env as cfEnv } from "cloudflare:workers";
```

Use the alias `cfEnv` because the file already declares a local variable called `env` inside the request handler - keeping them distinct prevents accidental shadowing.

- [ ] **Step 2: Replace the `Astro.locals.runtime.env` access**

Currently `src/pages/api/ai.ts:65` reads:
```ts
const env = (locals as any).runtime.env;
```

Replace with:
```ts
const env = cfEnv as unknown as {
  AI_HEALTH_KV?: KVNamespace;
  ANTHROPIC_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};
```

The `as unknown as { ... }` is a deliberate narrowing because the workerd `env` module is typed as the auto-generated `Env` global, which we don't currently regenerate via `wrangler types`. The narrowing covers exactly the keys this endpoint touches.

- [ ] **Step 3: Confirm the `locals` parameter is still needed**

Read the function signature at `src/pages/api/ai.ts:56`:
```ts
export const POST: APIRoute = async ({ request, locals }) => {
```

If `locals` is not used anywhere else in the function after Step 2, drop it from the destructure to silence the `noUnusedParameters` check:
```ts
export const POST: APIRoute = async ({ request }) => {
```

Use Grep within the file to be certain - if the only `locals` reference was on the line you just rewrote, remove it.

- [ ] **Step 4: Type-check this single file as a sanity check**

Run: `npx tsc --noEmit --project tsconfig.json 2>&1 | grep "src/pages/api/ai.ts" || echo "ok"`
Expected: prints `ok`, meaning no type errors are flagged in this file specifically.

---

## Task 5: Update `wrangler.toml` for Astro 6 + Cloudflare v13

**Files:**
- Modify: `wrangler.toml`

The Cloudflare adapter v13 requires the wrangler entrypoint to point at the adapter's bundled server (used by both `astro dev` running in workerd and production deployments). It also benefits from a recent `compatibility_date` and the `nodejs_compat` flag (the project uses Node-flavoured APIs in some non-prerendered paths and in scripts; without the flag, lib changes can surface as workerd errors).

- [ ] **Step 1: Replace the entire contents of `wrangler.toml` with the v13-shaped config**

Replace the file contents with:
```toml
name = "daniellocatelli"
main = "@astrojs/cloudflare/entrypoints/server"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "AI_HEALTH_KV"
id = "09f3adcd21b64b7589e4d5260ed879e3"
```

Notes for the engineer:
- `main` is the new Cloudflare adapter entrypoint - mandatory in v13.
- `compatibility_date` is bumped from `2024-12-01` to `2026-04-01` (any date >= `2026-01-01` is fine; today's date is 2026-04-25 but we pick a slightly older one to avoid the v13.2.1-fixed "compatibility_date defaulting to today" bug edge case).
- `compatibility_flags = ["nodejs_compat"]` enables the workerd Node compat shim. The prerender path may need it for `node:fs/promises` (used lazily inside `generateBlurDataUrl`) and for `dotenv`. If the build/dev still fails with "node:* not supported" after this flag, the next step is `compatibility_flags = ["nodejs_compat", "nodejs_compat_v2"]`.
- The `[assets]` binding is intentionally NOT declared - the Cloudflare adapter v13 auto-provisions it (along with `SESSION` KV and `IMAGES`) at build time, regardless of whether `wrangler.toml` exists. Declaring it manually is allowed but redundant; leaving it out reduces conflict risk.

- [ ] **Step 2: Verify wrangler can still parse the file**

Run: `npx wrangler types --env-interface CloudflareEnv 2>&1 | head -20`

Expected: emits a `worker-configuration.d.ts` (or similar) file describing the bindings. If wrangler complains about syntax, re-check the file you just wrote.

- [ ] **Step 3: Add the generated types file to `.gitignore` if it isn't already**

Run: `grep -E "worker-configuration|cloudflare-env\.d\.ts" .gitignore || echo "MISSING"`
If `MISSING` is printed, append `worker-configuration.d.ts` and `cloudflare-env.d.ts` to `.gitignore`. Otherwise leave it.

---

## Task 6: Configure the Cloudflare adapter's image service explicitly

**Files:**
- Modify: `astro.config.mts:35`

The adapter v13 default image service changed from `'compile'` (build-time Sharp) to `'cloudflare-binding'` (runtime via Cloudflare Images). This project uses Sharp at build time only (inside `generateBlurDataUrl`, the `<Image>` / `<Picture>` components, and `assets/`) and does NOT have a Cloudflare Images binding configured. To preserve current behaviour, pin both the build and runtime services explicitly.

- [ ] **Step 1: Open `astro.config.mts` and locate the adapter line**

Currently at line 35:
```ts
adapter: cloudflare(),
```

- [ ] **Step 2: Replace with explicit imageService config**

Replace with:
```ts
adapter: cloudflare({
  imageService: { build: "compile", runtime: "passthrough" },
}),
```

What this does:
- `build: "compile"` keeps Astro's built-in Sharp service for static image processing at build time (the same behaviour as Astro 5).
- `runtime: "passthrough"` makes runtime image requests serve the original asset as-is via the `ASSETS` binding (no transformation), which avoids needing a Cloudflare Images binding.
- This pairs with the lazy-loaded Sharp import in `src/lib/blog-helpers.ts:250`, which only runs at build time anyway.

- [ ] **Step 3: Verify the config still parses**

Run: `npx astro sync`
Expected: completes without complaint about the adapter shape. If it errors with "Unknown option: imageService", the cloudflare adapter did not actually upgrade to v13 - go back to Task 2 step 2.

---

## Task 7: Type-check the full project

**Files:** none (verification only)

This is the first end-to-end check after all migrations are in place.

- [ ] **Step 1: Run astro check**

Run: `npx astro check 2>&1 | tee /tmp/check-post-upgrade.log`

Expected: same or fewer diagnostics than `/tmp/check-baseline.log` from Task 1. Specifically, no new errors of the form:
- `Property 'runtime' does not exist on type ...`
- `Module '"astro:content"' has no exported member 'z'`
- `Cannot find module 'cloudflare:workers'`

If new errors appear, work through them one by one before continuing.

- [ ] **Step 2: Diff the baseline and post-upgrade check logs**

Run: `diff /tmp/check-baseline.log /tmp/check-post-upgrade.log | head -100`

Expected: changes are limited to file/line shifts caused by edits in Tasks 3-6. Any new error categories must be resolved.

---

## Task 8: Boot the dev server in workerd

**Files:** none (verification only)

This is the moment of truth - in v13 the dev server runs in workerd, which is what blew up the previous attempt.

- [ ] **Step 1: Start the dev server in the background**

Run: `npm run dev` (run as a backgrounded process or in a separate terminal so you can curl it).

Expected: server starts, prints `Local: http://localhost:4321/`, and stays up. NO `module is not defined`, NO `Cannot find module 'sharp'`, NO `Cannot find module 'node:fs'`.

If you see `module is not defined`: identify which import is the offender by reading the stack trace. The fix pattern is the same one used in `src/lib/blog-helpers.ts:245-263` - lazy-load the offending module inside an async function so it never enters the module-init graph.

- [ ] **Step 2: Hit the homepage**

Run: `curl -fsS http://localhost:4321/ -o /dev/null && echo OK`
Expected: prints `OK`.

- [ ] **Step 3: Hit a content collection page**

Run: `curl -fsS http://localhost:4321/projects/ -o /dev/null && echo OK`
Expected: prints `OK`.

- [ ] **Step 4: Hit the AI chat endpoint with an obviously-bogus body to verify env access works**

Run:
```bash
curl -fsS -X POST http://localhost:4321/api/ai \
  -H "Content-Type: application/json" \
  -d '{"question":"ping"}' \
  -o /tmp/ai-response.json
cat /tmp/ai-response.json
```

Expected: returns a real Anthropic response (or an error mentioning the upstream Supabase call - not "Cannot read properties of undefined (reading 'env')" or "ANTHROPIC_API_KEY is missing"). The presence of a non-env-related response confirms `cfEnv.ANTHROPIC_API_KEY` resolved correctly.

- [ ] **Step 5: Stop the dev server**

Send Ctrl+C / kill the backgrounded process.

---

## Task 9: Production build

**Files:** none (verification only)

- [ ] **Step 1: Run the full build**

Run: `npm run build 2>&1 | tee /tmp/build-post-upgrade.log`

Expected: completes without error, producing `dist/` with `dist/_worker.js/` (or whatever v13 emits) and `dist/client/` populated.

If the build fails with `module is not defined`, the same lazy-load fix as Task 8 step 1 applies, but at build time. Capture which file in the stack trace and decide whether to lazy-load or move it into a `prerender = false` route.

- [ ] **Step 2: Verify the generated wrangler config in dist matches expectations**

Run: `cat dist/server/wrangler.json | head -5` (path may differ in v13 - try `dist/_worker.js/wrangler.json` if the first path is missing).

Expected: includes `"main"`, `"assets"`, and your `AI_HEALTH_KV` binding. The auto-provisioned `SESSION` KV may also appear - that's fine.

- [ ] **Step 3: Run `astro preview` to confirm the production worker boots locally**

Run: `npm run preview` in the background.

Expected: serves on `http://localhost:4321/` (or whatever port preview picks). Hit a couple of routes:
```bash
curl -fsS http://localhost:4321/ -o /dev/null && echo OK
curl -fsS http://localhost:4321/projects/ -o /dev/null && echo OK
```

Both should print `OK`. Stop preview with Ctrl+C.

---

## Task 10: Update repo-level docs to reflect Astro 6 + Workers

**Files:**
- Modify: `README.md:22`
- Modify: `README.md:27` (Deployment row)
- Modify: `CLAUDE.md` (Tech Stack section)

Both docs claim "Astro 5" or "Cloudflare Pages". Bring them in line with reality.

- [ ] **Step 1: Update README Tech Stack table - Astro version row**

In `README.md`, change:
```
| **Framework** | [Astro 5](https://astro.build/) with TypeScript |
```
to:
```
| **Framework** | [Astro 6](https://astro.build/) with TypeScript |
```

- [ ] **Step 2: Update README Tech Stack table - Deployment row**

In `README.md`, change:
```
| **Deployment** | [Cloudflare Pages](https://pages.cloudflare.com/) |
```
to:
```
| **Deployment** | [Cloudflare Workers](https://workers.cloudflare.com/) (Static Assets) |
```

- [ ] **Step 3: Update CLAUDE.md Tech Stack**

In `CLAUDE.md`, change:
```
- **Framework:** Astro 5 with TypeScript
```
to:
```
- **Framework:** Astro 6 with TypeScript
```

And change:
```
- **Deployment:** Cloudflare Pages (`@astrojs/cloudflare`)
```
to:
```
- **Deployment:** Cloudflare Workers with Static Assets (`@astrojs/cloudflare`)
```

---

## Task 11: Final commit

**Files:** none (git only)

- [ ] **Step 1: Review all changes**

Run: `git status` and `git diff --stat`.

Expected files modified:
- `package.json`
- `package-lock.json`
- `astro.config.mts`
- `wrangler.toml`
- `src/content.config.ts`
- `src/pages/api/ai.ts`
- `README.md`
- `CLAUDE.md`
- (possibly) `.gitignore` if Task 5 step 3 added entries

Anything else - investigate before committing.

- [ ] **Step 2: Stage and commit with a focused message**

Run:
```bash
git add package.json package-lock.json astro.config.mts wrangler.toml \
        src/content.config.ts src/pages/api/ai.ts README.md CLAUDE.md
# Add .gitignore only if Task 5 step 3 modified it:
git add .gitignore 2>/dev/null
git commit -m "$(cat <<'EOF'
chore(deps): upgrade to Astro 6 + Cloudflare adapter v13

Migrates breaking changes:
- z imported from astro/zod (no longer re-exported from astro:content)
- src/pages/api/ai.ts uses env from cloudflare:workers instead of
  Astro.locals.runtime.env (removed in v13)
- wrangler.toml uses @astrojs/cloudflare/entrypoints/server, bumped
  compatibility_date, and adds nodejs_compat for the prerender path
- adapter pins imageService { build: compile, runtime: passthrough }
  to keep Astro 5 behaviour now that the v13 default switched to
  cloudflare-binding

The previous attempt (5c7c165) was reverted because workerd choked on
sharp/node:fs in the SSR graph. ee4d156 already lazy-loaded those, so
this re-attempt boots cleanly in dev (workerd) and builds + previews
without errors.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Verify the commit**

Run: `git log -1 --stat`
Expected: commit lists all the files from step 1, no surprises.

- [ ] **Step 4: Do NOT push**

Leave pushing for the user to do after manual verification. The plan is done at this point.

---

## Post-implementation manual verification (for the user, not the agent)

After the plan executes, the user should:
1. `npm run dev` and click through the homepage in all three locales (en/pt/de).
2. Open the AI chat on the homepage and ask a real question.
3. Verify that `wrangler deploy` (or whatever the user's deploy flow is) still works.
4. Run `npx tsx scripts/benchmark-chat.ts` against a deployed preview - expect 100% pass rate per CLAUDE.md.

If any of those fail, capture the exact error and reopen this plan for a follow-up task.
