---
Cover: /assets/content/research/agent-skills/agent-skills-cover.svg
CoverAlt: "The glowing green Claude Code icon and a graduation-cap icon side by side: an agent plus a skill."
CoverFit: contain
Description: "A living list of the agent skills I rely on when working with Claude Code: the ones I wrote, Matt Pocock's engineering and productivity skills, and community skills such as Diagram Design."
Name: Agent skills
Tags:
  - Agent skills
  - AI coding agents
Authors:
  - Daniel Nunes Locatelli
DateStart: "2026-08-19"
Link:
  Text: daniel-locatelli/skills on GitHub
  Href: https://github.com/daniel-locatelli/skills
OtherLinks:
  - Text: mattpocock/skills
    Href: https://github.com/mattpocock/skills
  - Text: cathrynlavery/diagram-design
    Href: https://github.com/cathrynlavery/diagram-design
---

An agent skill is a folder with a `SKILL.md` file: a short, well-scoped set of instructions, references, and scripts that a coding agent loads when a task matches its description. It is the unit in which expertise travels between people and agents. Most of what I have learned about working with Claude Code in 2026 has ended up in skills, either mine or other people's, so this page keeps track of the ones that have earned a permanent place in my setup. It is a living list; I add to it as skills prove themselves and remove the ones that stop pulling their weight.

![Three columns of SKILL.md tiles (my own, Matt Pocock's, community) feeding a single coding agent.](/assets/content/research/agent-skills/agent-skills-diagram.svg)

## My own skills

These live in the public repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills) and install with `/plugin marketplace add daniel-locatelli/skills` in Claude Code or `npx skills@latest add daniel-locatelli/skills` in any other agent. The common thread is that LLM training data goes stale exactly where AEC APIs move fastest, so each skill pins the version-critical facts and enforces a verified build, deploy, and test loop instead of dumping knowledge.

- **creating-revit-plugin**: build, scaffold, and debug Revit desktop add-ins in C#/.NET, current for Revit 2027 (.NET 10) and 2025/2026 (.NET 8). Transactions, the valid-API-context rule, ribbon UI, `ExternalEvent` for modeless dialogs, multi-version targeting, and a buildable Revit 2027 scaffold.
- **creating-grasshopper-plugin**: compiled Grasshopper plugins (`.gha`) for Rhino 8 in C#, from `Rhino.Templates` scaffolding to data trees, local deploy, Yak packaging, and load-failure diagnosis.
- **using-cordyceps**: give the agent a running Rhino it can drive through the Cordyceps MCP server: place and wire canvas components, configure script components, read solver outputs, bake and render scenes.
- **optimizing-web-performance**: the Lighthouse loop for a deployed site: audit production, fix the two or three things that move the score, verify with a comparable measurement, ship.
- **auditing-website-quality**: hub for an in-depth site audit that runs each dimension's sub-skill and aggregates the findings into a dated scorecard ranked by severity divided by effort.
- **auditing-agent-readiness**: is the site discoverable and usable by AI agents? Checks `llms.txt`, markdown variants, robots AI rules, `.well-known` descriptors, and a live MCP handshake.

This website also serves two skills of its own under `/.well-known/agent-skills/`: **portfolio-content** (read the site as plain markdown) and **portfolio-mcp** (query it through the read-only MCP server). They are described on the [portfolio website](/projects/portfolio-website) page.

A few more skills stay private for now because they encode personal workflow rather than reusable knowledge: a PhD assistant that runs an adversarial planning session at the start and end of each working day, a `system` index of every repo, skill, and standard I own, a pre-PR ritual for contributing to repositories I do not own, and two domain references for BTLx timber fabrication files and the compas_ifc library.

## Matt Pocock's skills

[mattpocock/skills](https://github.com/mattpocock/skills) (MIT, `npx skills@latest add mattpocock/skills`) is the set I reach for most often when the task is about thinking rather than typing. The ones I keep installed:

- **grill-me**: a relentless interview that sharpens a plan or design until every branch of the decision tree is resolved. I use it before any non-trivial piece of work, and the `grilling` primitive behind it is what my own PhD skill is built on.
- **grill-with-docs**: the same interview, but it writes the project's `CONTEXT.md`, glossary, and ADRs as it goes.
- **codebase-design** and **domain-modeling**: shared vocabulary for deep modules with small interfaces, and a procedure for pinning down a project's domain language and recording architectural decisions.
- **improve-codebase-architecture**: scans a codebase for deepening opportunities, presents them as a visual HTML report, and grills through whichever one you pick.
- **handoff**: compacts the current conversation into a document another agent can pick up, which is how I move work between sessions and machines.
- **teach**: teaches a concept across multiple sessions using a directory as the workspace, with a learning record and glossary.

## Community skills

- **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** by Cathryn Lavery: editorial-quality diagrams as self-contained HTML with inline SVG, 28 visual types, brand onboarding from a website, and a Mermaid import that redraws rather than converts. It replaced the Mermaid flowchart on this site's [portfolio website](/projects/portfolio-website) page with a hand-laid architecture diagram in the site's own palette, and a saved profile plus a `.diagram-design` marker in the repository make every future diagram come out in the same skin. Install: `/plugin marketplace add cathrynlavery/diagram-design`, then `/plugin install diagram-design@diagram-design`.
- **[Superpowers](https://github.com/obra/superpowers)** by Jesse Vincent: the process layer underneath everything else: brainstorming before building, test-driven development, systematic debugging, plan writing and execution, and verification before claiming completion.
- **frontend-design** from the official Claude plugin marketplace: guidance for distinctive, intentional visual design when building or reshaping UI.

## How I decide what stays

A skill earns its place when it changes what the agent does on a task I actually have, not because it is clever. The test is the same one Diagram Design applies to its own diagrams: would a well-written paragraph in `CLAUDE.md` do the same job? If yes, the skill goes. If the skill keeps a verified loop honest, pins facts the model gets wrong, or asks the questions I forget to ask, it stays.
