"""Generate the benchmark pipeline and the W0/W1 workflow diagrams (diagram-design, left to right).

Same grammar and palette as gen_routes.py; run with the same two output folders.
"""
import sys, os, html
from gen_routes import (PAPER, DIM, AMBER, MONO, RULE, COL, ROW, NH, elbow, vh, svg)

mid = lambda r: r + NH // 2


def text(x, y, s, color=DIM, size=12, anchor="start", spacing="0.14em"):
    return (f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" font-family="{MONO}" '
            f'text-anchor="{anchor}" letter-spacing="{spacing}">{html.escape(s)}</text>')


PIPELINE = dict(
    slug="flow-pipeline", name="FlowPipeline", w=1240, h=400,
    title="One benchmark run, from the package to the register",
    desc="The package (program, existing building, limits) and the task text, composed from one passage per factor level, go into a fresh, isolated container where the agent works for up to 60 minutes. Its design.ifc, statement and references are scored by the checker, rendered by the viewer from three fixed cameras, and recorded in the register with the time, turns and cost from the proxy log.",
    under=(f'<rect x="332" y="128" width="256" height="144" rx="8" fill="rgba(224,164,88,0.04)" stroke="{AMBER}" stroke-opacity="0.6" stroke-width="1" stroke-dasharray="4,4"/>'
           + text(340, 120, "ISOLATED CONTAINER", AMBER, 10)),
    nodes=[
        dict(x=COL[0], y=ROW[0], kind="input", tag="IN", name="Package", sub="program, existing, limits"),
        dict(x=COL[0], y=ROW[2], kind="input", tag="IN", name="Factor levels", sub="one passage each"),
        dict(x=COL[1], y=ROW[1], kind="focal", tag="AGENT", name="Claude Code", sub="opus-5-5, 60 min"),
        dict(x=COL[2], y=ROW[1], kind="output", tag="OUT", name="design.ifc", sub="statement, references"),
        dict(x=COL[3], y=ROW[0], kind="step", name="Checker", sub="6 rules + hypar"),
        dict(x=COL[3], y=ROW[1], kind="step", name="Viewer", sub="3 fixed cameras"),
        dict(x=COL[3], y=ROW[2], kind="step", name="Register", sub="time, turns, cost"),
    ],
    edges=[
        dict(kind="default", d=elbow(240, mid(ROW[0]), 360, 184, 320), label="brief/", at=(278, mid(ROW[0]))),
        dict(kind="default", d=elbow(240, mid(ROW[2]), 360, 216, 320), label="task.md", at=(278, mid(ROW[2]))),
        dict(kind="accent", d=f"M560 {mid(ROW[1])} H680"),
        dict(kind="default", d=elbow(880, 184, 1000, mid(ROW[0]), 940)),
        dict(kind="default", d=f"M880 {mid(ROW[1])} H1000"),
        dict(kind="default", d=elbow(880, 216, 1000, mid(ROW[2]) - 12, 940)),
        dict(kind="default", d=vh(460, 240, 1000, 340), label="PROXY LOG, TRANSCRIPT", at=(720, 340)),
    ],
)

# W0 / W1: rows of their own
D_Y, R_Y = 200, (128, 208, 288)
WORKFLOW = dict(
    slug="flow-workflow", name="FlowWorkflow", w=1240, h=420,
    title="Workflow levels: one designer, or a designer with three reviewers",
    desc="W0: one designer works for 60 minutes and delivers the design. W1: the designer works for 60 minutes; three reviewers (compliance, structure and fabrication, architectural quality) read the design in parallel for 10 minutes each; the designer then revises for 20 minutes in the same session. W1's first draft is scored too.",
    under=(text(40, 77, "W0", AMBER, 14) + text(40, 246, "W1", AMBER, 14)
           + f'<line x1="40" y1="116" x2="1200" y2="116" stroke="{RULE}" stroke-width="0.8"/>'),
    nodes=[
        dict(x=120, y=40, h=64, kind="step", name="Designer", sub="60 min"),
        dict(x=1000, y=40, h=64, kind="output", tag="OUT", name="design.ifc", sub="scored"),
        dict(x=120, y=D_Y, kind="step", name="Designer", sub="60 min"),
        dict(x=420, y=R_Y[0], h=64, w=220, kind="step", name="Compliance", sub="rules, brief · 10 min"),
        dict(x=420, y=R_Y[1], h=64, w=220, kind="step", name="Structure", sub="load path, CNC · 10 min"),
        dict(x=420, y=R_Y[2], h=64, w=220, kind="step", name="Architecture", sub="form, space · 10 min"),
        dict(x=720, y=D_Y, kind="focal", name="Designer revises", sub="20 min, same session"),
        dict(x=1000, y=D_Y, kind="output", tag="OUT", name="design.ifc", sub="scored"),
        dict(x=120, y=340, h=64, kind="output", name="Draft", sub="also scored"),
    ],
    edges=[
        dict(kind="default", d="M320 72 H1000", label="NO REVIEW", at=(660, 72)),
        dict(kind="default", d=elbow(320, 224, 420, 160, 372)),
        dict(kind="default", d="M320 240 H420"),
        dict(kind="default", d=elbow(320, 256, 420, 320, 372)),
        dict(kind="default", d=elbow(640, 160, 720, 224, 680)),
        dict(kind="default", d="M640 240 H720"),
        dict(kind="default", d=elbow(640, 320, 720, 256, 680)),
        dict(kind="accent", d="M920 240 H1000"),
        dict(kind="default", d="M220 280 V340"),
    ],
)

if __name__ == "__main__":
    out_html, out_astro = sys.argv[1], sys.argv[2]
    os.makedirs(out_html, exist_ok=True); os.makedirs(out_astro, exist_ok=True)
    for d in (PIPELINE, WORKFLOW):
        s = svg(d, d["slug"] + "-", W=d["w"], H=d["h"], show_legend=False)
        page = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                f'<title>{html.escape(d["title"])}</title><style>body{{margin:0;background:{PAPER};padding:40px}} svg{{width:100%;height:auto;display:block}}</style></head>'
                f'<body>\n{s}\n</body></html>')
        open(os.path.join(out_html, d["slug"] + ".html"), "w", encoding="utf-8").write(page)
        astro = ("---\n// " + d["title"] + ". Generated by gen_flows.py (diagram-design grammar);\n"
                 "// from the study's README and infra/matrix/task/ on 2026-10-12.\n---\n\n" + s + "\n")
        open(os.path.join(out_astro, d["name"] + ".astro"), "w", encoding="utf-8").write(astro)
        print("wrote", d["slug"])
