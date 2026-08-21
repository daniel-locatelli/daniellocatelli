---
Cover: /assets/content/research/agent-skills/agent-skills-cover-wearing-cap.svg
CoverAlt: "The green Claude Code icon wearing a graduation cap: an agent with a skill."
CoverFit: contain
Description: "A living list of the agent skills I rely on when working with Claude Code: the ones I wrote, Matt Pocock's engineering and productivity skills, and community skills such as Superpowers and Diagram Design."
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
  - Text: obra/superpowers
    Href: https://github.com/obra/superpowers
---

An agent skill is a folder with a `SKILL.md`: a short, well-scoped set of instructions, references, and scripts that a coding agent loads when a task matches its description. It is the unit in which expertise travels between people and agents. This page is a living list of the skills that have earned a permanent place in my Claude Code setup.

![Three boxes of skill tiles feed one coding agent: my own skills, grouped into AEC, quality and personal, sit on top; Matt Pocock's skills and community skills sit below.](/assets/content/research/agent-skills/agent-skills-diagram.svg "My skills, Matt Pocock's and community skills feed one agent")

## My own skills

The published ones live in the public repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills), grouped by the tool or domain they serve (Revit, Grasshopper, timber, web, git). They are the skills I would hand to a colleague: each one is about how a tool or a format behaves, not about me. A further set of personal skills stays private because it encodes my own setup: where things live, how they are backed up, how the doctorate is run. Both kinds follow the same shape. A `SKILL.md` says when to trigger, pins the facts the model tends to get wrong, and names the loop the agent has to close before it may call the work done.

### AEC

Four skills for the tools I work with daily in architecture, engineering, and construction. The two plugin skills answer the same problem: LLM training data goes stale exactly where the Revit and Rhino APIs move fastest, so rather than dumping knowledge, each pins the version-critical facts (target frameworks, API changes, manifest and deployment paths) and holds the agent to a verified build, deploy, and test loop. The other two reach into the tools themselves. **using-cordyceps** drives a live Rhino and Grasshopper session through an MCP server: placing and wiring components, configuring script components, reading solver output, rendering the scene. **working-with-btlx** is the reference the agent must read before answering anything about the BTLx timber CNC format, because parameter ranges, reference sides, and schema versions are exactly the details it would otherwise guess.

| Skill | What it does |
| --- | --- |
| **creating-revit-plugin** | Build native add-ins for Revit 2025 to 2027 |
| **creating-grasshopper-plugin** | Build compiled Grasshopper plugins for Rhino 8 |
| **using-cordyceps** | Drive a live Rhino and Grasshopper session from the agent |
| **working-with-btlx** | Work with BTLx, the timber CNC exchange format: processings, reference sides, schema versions |

### Quality

Three of these audit a deployed website, and they nest. **optimizing-web-performance** fixes the Core Web Vitals and accessibility findings that move a Lighthouse score. **auditing-agent-readiness** checks the newer question of whether an AI agent can discover and use the site: `llms.txt`, markdown variants, `.well-known` manifests, an MCP handshake. **auditing-website-quality** runs both, adds SEO, security headers, and content and i18n integrity, and turns the result into one ranked scorecard fit to hand to a client. The fourth, **preparing-pull-request**, is about the quality of what I send to other people's repositories: before a PR or issue goes out, it traces the defect through blame and history, sweeps the upstream tracker for duplicates and in-flight work, and verifies every claim the PR body makes. What they share is that none of them lets the agent say "done" without evidence.

| Skill | What it does |
| --- | --- |
| **optimizing-web-performance** | Run Lighthouse on a live site and fix what moves the score |
| **auditing-website-quality** | Audit a site end to end into a ranked scorecard |
| **auditing-agent-readiness** | Check whether a site is discoverable and usable by AI agents |
| **preparing-pull-request** | Trace a defect's origin and sweep the upstream tracker before opening a PR on someone else's repository |

### Personal

These stay private because they encode how I work rather than how a tool works. At the centre is **system**, a single source-of-truth map: it tells the agent which skills, repositories, operational systems, and life domains exist, where each one lives, how to start it, and which of my written conventions governs it (how repositories are laid out on disk, how folders are named and archived, which stack a new project defaults to). An example: my Drive is split into life domains (Finance, Home, Health, Professional, Research, Teaching, and so on), each with its own rulebook, and every file has exactly one home inside them. A new insurance policy goes under `Finance/Insurance/` in a folder named `YYYY-MM_Insurer`, dated by when the policy started rather than when I stored it; when it ends, the folder is swept into a sibling `_Archive/` so the top level shows only what is current. Cross-cutting topics are connected by wikilinks instead of copies. Because the skill knows these rules, the agent files the document itself and I never answer "where does this go" twice.

| Skill | What it does |
| --- | --- |
| **system** | Map every skill, repository, system, and life domain to where it lives and which convention governs it |
| **backup-system** | My files are spread across several HDDs and SSDs, and that layout grows more complex over time; this skill keeps everything systematically organized |
| **phd** | This is my PhD assistant: it opens and closes each working day with an adversarial review of the thesis, its claim, and its deadlines |
| **searching-librarian** | I keep a large personal library of research papers on a home server; this skill teaches the agent how to query it, by topic, author, DOI, or id, from any of my machines |

### Served by this website

Two more skills run the other way: they are not for my agent but for yours. This site publishes **portfolio-content** (read any page as plain markdown, in three languages) and **portfolio-mcp** (query projects, research, teaching, publications, and CV through the site's read-only MCP server) under `/.well-known/agent-skills/`, so an agent that lands here knows how to read the site without scraping it. How they are built is described on the [portfolio website](/projects/portfolio-website) page.

## Matt Pocock's skills

[mattpocock/skills](https://github.com/mattpocock/skills) is what I reach for when the task is about thinking rather than typing. Where my own skills pin facts about a tool, these shape the conversation itself. The two grill skills are the ones I use most: before any non-trivial piece of work, the agent interviews me until every open branch of the plan is resolved, and the docs variant leaves a record of the decisions (ADRs, a glossary) behind. **codebase-design** and **domain-modeling** give the agent and me a shared vocabulary for what a good module and a good domain language look like, and **improve-codebase-architecture** applies that vocabulary to an existing repository and reports where it could be deepened. **handoff** passes a conversation to another agent without losing its state, and **teach** turns the agent into a tutor for me: it makes the current folder a teaching workspace, with a mission, short self-contained lessons, reference sheets, and a record of what I have learned, so the topic is learned over several sessions rather than in one sitting.

| Skill | What it does |
| --- | --- |
| **grill-me** | Interrogate a plan until every branch is resolved |
| **grill-with-docs** | The same interview, writing project docs as it goes |
| **codebase-design** | Design deep modules with small interfaces |
| **domain-modeling** | Pin down a project's domain language |
| **improve-codebase-architecture** | Find and work through architecture improvements |
| **handoff** | Hand a conversation over to another agent |
| **teach** | Teach me a topic over several sessions, from a workspace of lessons, reference sheets, and learning records |

## Community skills

Skills written by people I do not know, found through the community and kept because they kept earning their place. Two of them are structural: Superpowers is the process layer under every other skill on this page, and Diagram Design is how the figures on this site get drawn. The third is Anthropic's own design skill.

| Skill | What it does |
| --- | --- |
| **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** | Editorial-quality diagrams, such as the architecture diagram on the [portfolio website](/projects/portfolio-website) page, by Cathryn Lavery |
| **[Superpowers](https://github.com/obra/superpowers)** | The process layer under everything else, from brainstorming to verification, by Jesse Vincent |
| **frontend-design** | Distinctive, intentional UI design |

## How I decide what stays

Two questions. First, is it specific to one project? Then it belongs in that repository's `CLAUDE.md`, the instructions file the agent reads on every session, and not in a skill: a skill is for knowledge that travels between projects, and between people. Second, would a well-written paragraph in `CLAUDE.md` do the same job? If yes, the skill goes. If it keeps a verified loop honest, pins facts the model gets wrong, or asks the questions I forget to ask, it stays.

## Where skills are heading

Almost every skill in circulation today, mine included, is about software: building plugins, driving tools, auditing websites, contributing upstream. That is where agents are most obviously useful now, but it is not where the format stops. A `SKILL.md` is a unit of expertise, and most expertise in architecture, engineering, and construction is not software knowledge: how to set up a parametric model so it survives design changes, how to read a structural or fabrication constraint off a drawing, what a timber detail must satisfy before it reaches the machine, which questions a practitioner asks before trusting a result. That is the knowledge I expect the next generation of skills to carry, written by the people who hold it, and it is where I plan to contribute next: skills from computational design and from AEC practice itself.
