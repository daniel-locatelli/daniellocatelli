# Broken link CI: design

Date: 2026-08-27
Status: approved, pending implementation plan

## Problem

The site accumulates link rot with no detection mechanism. External targets
disappear (the D.Loft plugin page linked from the Canyon project is gone), and
internal links can break silently on a slug rename. Nothing in the repo catches
either class today.

The only existing tooling, `src/scripts/validate-internal-links.ts`, checks
frontmatter `Link:` fields against content files. It does not look at markdown
body links, component or navigation hrefs, i18n strings, or anything external.
The D.Loft link is a body link, precisely the class it misses.

There is no CI in the repo at all: no `.github/`, no `.gitlab-ci.yml`.

## Scope

In scope: a link-checking pipeline only. Build, typecheck, unit tests, e2e and
deploy stay outside this change; Cloudflare continues to deploy as it does now.

Out of scope: repairing the dead links the first run finds. Each one needs a
judgement call (link to an archive.org snapshot, drop the link but keep the
prose, or point somewhere new) applied across en, pt and de. That is a separate
content pass.

## Constraints

- Single developer, no pull requests, commits land directly on `main`. There is
  no gate to block, so the value is fast local feedback plus a red run and an
  email when something rots.
- Repository is public, so GitHub Actions minutes are free and unmetered.
- Issues are enabled, so an issue is a viable report channel.
- Secrets are runtime only. `ANTHROPIC_API_KEY` and `SUPABASE_URL` are read from
  `env` inside request handlers, so `astro build` runs in CI with no secrets.
- Node 24, pnpm 11.17.0 pinned through `packageManager`.
- Roughly 307 unique external URLs across `src/content`, `src/i18n`,
  `src/components` and `src/pages`. Heaviest hosts: doi.org (17), github.com
  (16), markobrajovic.com (14), icd.uni-stuttgart.de (13), art-engineering.net
  (10).

## Key decisions

### Crawl the built output, not the sources

The checker reads `dist/client/` after `pnpm build`. This catches every link a
visitor can see, including links produced by components and by i18n string
interpolation, across all three locales, and it lets an internal link be
verified against a page that actually got emitted. Parsing sources instead
would be faster but blind to generated markup.

### Split internal from external

Internal link failures are deterministic and always real, so they fail the run
on every push to `main`.

External link failures are probabilistic. DOI resolvers rate-limit, university
hosts go down for maintenance, and bot-protected sites refuse CI runners. A
pipeline that reddens on those gets ignored within a month. External checking
therefore runs on a weekly schedule, never fails a run, and reports into a
single long-lived GitHub issue.

### Respect `_redirects`

Astro emits `dist/client/_redirects`, a plain-text map with roughly 30 rules,
including `/research/dokwood-bsdd-data-dictionary` to
`/research/timber-buildup-data-model`. Any offline checker unaware of that file
reports every old-slug link as a 404. The internal checker parses it and treats
the left column as valid targets.

### Buy the external half, build the internal half

External uses lychee, which already solves retries, backoff, per-host rate
limiting, redirect chains and response caching. Internal is custom, because it
needs site-specific knowledge (the `_redirects` map, the locale layout, anchor
resolution) that lychee has no way to acquire without hand-maintained remap
rules mirroring every redirect.

### Verify before reporting: the ladder

This is the core of the design. Measured on 2026-08-27:

| URL | HEAD, default UA | GET, browser UA |
| --- | --- | --- |
| `www.food4rhino.com/en/app/dloft` | 403 | 403 |
| `www.food4rhino.com/` | 403 | 200 |
| `art-engineering.net/` | 200 | 200 |
| `doi.org/10.1016/j.autcon.2021.103571` | 302 | 200 (Elsevier) |

Two conclusions. A HEAD-based checker reports the whole food4rhino host as
dead, which is a pure false positive. And with a browser user agent the host
root answers 200 while the D.Loft page still refuses, which is exactly the
signal separating a bot-walled host from a page that is genuinely gone.

So lychee only nominates suspects. Every nominated URL is then re-tested:

1. HEAD with a browser user agent, following redirects.
2. On failure, GET with a browser user agent and `Accept: text/html`.
3. On failure, probe the URL's origin root with the same GET, then classify:
   - root 200 and page fails: CONFIRMED BROKEN (the D.Loft case)
   - root also fails: UNVERIFIABLE, bot-walled or host down
   - page returns 404 or 410: CONFIRMED BROKEN regardless of root

Only CONFIRMED BROKEN opens or reopens an issue. UNVERIFIABLE is listed in the
issue body as context when an issue exists for other reasons, but never
triggers one on its own. A Cloudflare-fronted host can therefore never nag.

Politeness: concurrency capped at 4 with a small per-host delay, so the
verifier does not itself trigger the rate limiting it is trying to distinguish
from real failure.

## Components

### `src/scripts/check-links-internal.ts` (new)

Reads `dist/client/`. Parses HTML with `linkedom`, already a devDependency.

Valid-target set: emitted `.html` paths in both trailing-slash and bare forms,
static asset files, and every source path in the left column of `_redirects`.

Extracted references: `a[href]`, `link[rel=canonical]`, and
`link[rel=alternate][hreflang]`. Alternates matter because broken hreflang
between en, pt and de is otherwise invisible.

Classification: skip `mailto:` and `tel:`; treat off-origin http(s) as external
and ignore it here; resolve relative and root-relative paths; treat absolute
`https://daniellocatelli.com/...` as internal, validate it as a path, and warn
that it should be relative.

Fragments: when a link carries `#frag`, load the target document and confirm an
element with that id exists. This catches broken table-of-contents links.

Redirects: a link resolving only through `_redirects` is valid, but the redirect
target is resolved one hop and validated; chains and loops are reported.

Output: a report grouped by source file, exit code 1 on any failure, `--json`
for a CI artifact.

### `lychee.toml` and `.lycheeignore` (new)

Runs over `dist/client/**/*.html`, so it checks what actually ships and dedupes
URLs automatically. Browser user agent, generous timeout, retries with backoff,
capped concurrency, `--cache` persisted through `actions/cache`. Excludes
`mailto:`, `tel:` and `daniellocatelli.com`, which the internal checker owns.
Accepts 200, 206 and the 3xx redirect codes.

`.lycheeignore` ships holding only genuine non-targets such as documentation
placeholder domains. Currently-dead URLs are deliberately not seeded into it;
the first run is expected to be red, and that report is the deliverable.

### `src/scripts/verify-dead-links.ts` (new)

Consumes lychee's JSON output, applies the ladder above, and emits a markdown
report with a CONFIRMED BROKEN section and an UNVERIFIABLE section. Each entry
records the URL, the source files linking it, the final status code and the
redirect chain if any.

### `.github/workflows/links.yml` (new)

Job `internal`: triggers on push to `main` and `workflow_dispatch`. Checks out,
sets up Node 24 and pnpm with a store cache, installs, runs `pnpm build`, then
`pnpm check:links:internal`. Fails the run on broken links.

Job `external`: triggers on a weekly cron and `workflow_dispatch`. Builds, runs
lychee with `fail: false`, runs the verifier, then uses the `gh` CLI to find the
open issue labelled `broken-links` and edit its body if one exists, create it if
not, and close it when the confirmed list is empty. One living issue, never a
weekly pile of duplicates.

### `package.json`

Adds `check:links:internal`, `check:links:external` and `check:links` (build
plus internal). The existing `validate:links` stays untouched: it is
complementary and runs before a build exists.

## Error handling

- Build failure fails the run in both jobs; there is nothing to check without
  `dist/`.
- lychee failures never fail the run; it only nominates.
- Verifier network errors classify as UNVERIFIABLE rather than crashing, so one
  unreachable host cannot lose the whole report.
- Failure of the issue create, update or close step fails the run loudly, since
  a silently unreported result is worse than a red run.

## Testing

Unit tests under `tests/unit/`, in the existing `tsx --test` style:

- path normalization, trailing slash equivalence, and locale prefixes
- `_redirects` parsing, including one-hop resolution and loop detection
- anchor resolution against fixture HTML
- ladder classification given mocked responses, covering each of the four
  outcomes, with the food4rhino and doi.org shapes above as named cases

## Risks

- CI build time of roughly 2 to 4 minutes on every push to `main`. Acceptable
  on a public repo with free minutes, and it does not block anything.
- lychee is an external binary and a supply chain dependency; it is pinned to a
  major version of the official action.
- The ladder reduces false positives but cannot eliminate them. A host that
  bot-walls a subpage while serving its root will read as CONFIRMED BROKEN. The
  issue is advisory, so a human confirms before editing content.
- The weekly cadence means an internal link can break only for as long as it
  takes to notice a red push run, and an external one for up to a week.
