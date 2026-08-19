---
Cover: /assets/content/research/agent-skills/agent-skills-cover-wearing-cap.svg
CoverAlt: "The green Claude Code icon wearing a graduation cap: an agent with a skill."
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

An agent skill is a folder with a `SKILL.md`: a short, well-scoped set of instructions, references, and scripts that a coding agent loads when a task matches its description. It is the unit in which expertise travels between people and agents. This page is a living list of the skills that have earned a permanent place in my Claude Code setup.

![Three boxes of skill tiles feed one coding agent: my own skills, grouped into AEC, quality and personal, sit on top; Matt Pocock's skills and community skills sit below.](/assets/content/research/agent-skills/agent-skills-diagram.svg)

## My own skills

These live in the public repository [daniel-locatelli/skills](https://github.com/daniel-locatelli/skills). What they share is a response to the same problem: LLM training data goes stale exactly where APIs move fastest, so rather than dumping knowledge, each skill pins the version-critical facts and holds the agent to a verified build, deploy, and test loop. They fall into three fields.

### AEC

| Skill | What it does |
| --- | --- |
| **creating-revit-plugin** | Build native add-ins for Revit 2025 to 2027 |
| **creating-grasshopper-plugin** | Build compiled Grasshopper plugins for Rhino 8 |
| **using-cordyceps** | Drive Rhino and Grasshopper from the agent |
| **working-with-btlx** | Work with BTLx, the timber CNC exchange format: processings, reference sides, schema versions |

### Quality

| Skill | What it does |
| --- | --- |
| **optimizing-web-performance** | Audit a live site and fix what moves the score |
| **auditing-website-quality** | Audit a site end to end into a ranked scorecard |
| **auditing-agent-readiness** | Check whether a site is usable by AI agents |
| **preparing-pull-request** | Trace a defect's origin and sweep the upstream tracker before opening a PR on someone else's repository |

### Personal

These stay private because they encode how I work rather than how a tool works. The one I use most is `system`, a single source-of-truth map: it tells the agent which skills, repositories, operational systems, and life domains exist, where each one lives, how to start it, and which standard applies. Instead of guessing where a file or a convention belongs, the agent asks "where does X live" or "what is my rule for Y" and gets a definite answer. It is less a skill than a personal assistant the other skills plug into. Directly under it sits a backup skill that encodes my storage model (which drive a file belongs on, tiering kept separate from backup, and a two-copy rule for anything irreplaceable) and runs the drift checks. Alongside them sit a PhD assistant that grills me on the thesis and a librarian search skill that queries a personal library of research papers converted to markdown, hosted on a Mac mini reachable over Tailscale from any of my machines.

### Served by this website

Two more skills run the other way: they are not for my agent but for yours. This site publishes **portfolio-content** (read any page as plain markdown, in three languages) and **portfolio-mcp** (query projects, research, teaching, publications, and CV through the site's read-only MCP server) under `/.well-known/agent-skills/`, so an agent that lands here knows how to read the site without scraping it. How they are built is described on the [portfolio website](/projects/portfolio-website) page.

## Matt Pocock's skills

[mattpocock/skills](https://github.com/mattpocock/skills) is what I reach for when the task is about thinking rather than typing.

| Skill | What it does |
| --- | --- |
| **grill-me** | Interrogate a plan until every branch is resolved |
| **grill-with-docs** | The same interview, writing project docs as it goes |
| **codebase-design** | Design deep modules with small interfaces |
| **domain-modeling** | Pin down a project's domain language |
| **improve-codebase-architecture** | Find and work through architecture improvements |
| **handoff** | Hand a conversation over to another agent |
| **teach** | Teach a concept across sessions |

## Community skills

| Skill | What it does |
| --- | --- |
| **[Diagram Design](https://github.com/cathrynlavery/diagram-design)** | Editorial-quality diagrams, such as the architecture diagram on the [portfolio website](/projects/portfolio-website) page, by Cathryn Lavery |
| **[Superpowers](https://github.com/obra/superpowers)** | The process layer under everything else, from brainstorming to verification, by Jesse Vincent |
| **frontend-design** | Distinctive, intentional UI design |

## How I decide what stays

Would a well-written paragraph in `CLAUDE.md` do the same job? If yes, the skill goes. If it keeps a verified loop honest, pins facts the model gets wrong, or asks the questions I forget to ask, it stays.

## Where skills are heading

Almost every skill in circulation today, mine included, is about software: building plugins, driving tools, auditing websites, contributing upstream. That is where agents are most obviously useful now, but it is not where the format stops. A `SKILL.md` is a unit of expertise, and most expertise in architecture, engineering, and construction is not software knowledge: how to set up a parametric model so it survives design changes, how to read a structural or fabrication constraint off a drawing, what a timber detail must satisfy before it reaches the machine, which questions a practitioner asks before trusting a result. That is the knowledge I expect the next generation of skills to carry, written by the people who hold it, and it is where I plan to contribute next: skills from computational design and from AEC practice itself.
