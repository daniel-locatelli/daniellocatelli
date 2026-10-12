"""Generate the three tool-stack route diagrams (diagram-design, flowchart, left to right).

Writes, per stack: <out_html>/<slug>.html (standalone preview for self_check.py)
and <out_astro>/<Name>.astro (inline SVG for the deck). All geometry on a 4px grid.
"""
import sys, os, html

PAPER, INK, DIM, SOFT, AMBER, SILICON = "#0e0c09", "#f2efe9", "#a49e92", "#6f6a61", "#e0a458", "#85b7cb"
AMBER_TINT = "rgba(224,164,88,0.12)"
RULE = "rgba(242,239,233,0.14)"
SANS = "Poppins, ui-sans-serif, system-ui, sans-serif"
MONO = "ui-monospace, Menlo, Consolas, monospace"

W, H = 1240, 468
COL = [40, 360, 680, 1000]          # node x per column
ROW = [40, 160, 280]                # node y per row
NW, NH = 200, 80


def node(n):
    x, y, kind = n["x"], n["y"], n["kind"]
    w, h = n.get("w", NW), n.get("h", NH)
    cx = x + w // 2
    stroke, fill, dash, tagc = INK, PAPER, "", DIM
    if kind == "focal":
        stroke, fill, tagc = AMBER, AMBER_TINT, AMBER
    elif kind == "input":
        stroke, fill = DIM, "rgba(164,158,146,0.10)"
    elif kind == "output":
        stroke, fill = DIM, "rgba(242,239,233,0.05)"
    elif kind == "unused":
        stroke, fill, dash, tagc = SILICON, PAPER, ' stroke-dasharray="4,4"', SILICON
    elif kind == "failed":
        stroke, fill, dash = SOFT, PAPER, ' stroke-dasharray="4,4"'
    namec = SILICON if kind == "unused" else (DIM if kind == "failed" else INK)
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{PAPER}"/>',
           f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="1.2"{dash}/>']
    if n.get("tag"):
        tw = 12 + 8 * len(n["tag"])
        out.append(f'<rect x="{x+8}" y="{y+8}" width="{tw}" height="16" rx="2" fill="none" stroke="{tagc}" stroke-opacity="0.5" stroke-width="0.8"/>')
        out.append(f'<text x="{x+8+tw//2}" y="{y+20}" fill="{tagc}" font-size="10" font-family="{MONO}" text-anchor="middle" letter-spacing="0.08em">{html.escape(n["tag"])}</text>')
    ny = y + h // 2 + (8 if n.get("sub") else 6)
    out.append(f'<text x="{cx}" y="{ny}" fill="{namec}" font-size="16" font-weight="600" font-family="{SANS}" text-anchor="middle">{html.escape(n["name"])}</text>')
    if n.get("sub"):
        out.append(f'<text x="{cx}" y="{ny+20}" fill="{DIM}" font-size="12" font-family="{MONO}" text-anchor="middle">{html.escape(n["sub"])}</text>')
    return "\n".join(out)


def elbow(x1, y1, x2, y2, xm):
    """Horizontal, vertical, horizontal with r=8 quarter arcs."""
    if y1 == y2:
        return f"M{x1} {y1} H{x2}"
    s = 8 if y2 > y1 else -8
    return (f"M{x1} {y1} H{xm-8} Q{xm} {y1} {xm} {y1+s} V{y2-s} Q{xm} {y2} {xm+8} {y2} H{x2}")


def vh(x1, y1, x2, y2):
    """Vertical then horizontal (leave a node's top or bottom edge)."""
    s = 8 if x2 > x1 else -8
    t = 8 if y2 > y1 else -8
    return f"M{x1} {y1} V{y2-t} Q{x1} {y2} {x1+s} {y2} H{x2}"


def label(x, y, text, color):
    """Label centred at x, its mask bottom 8px above the line at y."""
    w = 16 + 8 * len(text)
    return (f'<rect x="{x - w//2}" y="{y-28}" width="{w}" height="20" rx="2" fill="{PAPER}"/>'
            f'<text x="{x}" y="{y-14}" fill="{color}" font-size="12" font-family="{MONO}" text-anchor="middle" letter-spacing="0.06em">{html.escape(text)}</text>')


def edge(e):
    kind = e.get("kind", "default")
    color = {"accent": AMBER, "unused": SILICON, "failed": SOFT}.get(kind, DIM)
    marker = {"accent": "arrow-accent", "unused": "arrow-unused", "failed": "arrow-failed"}.get(kind, "arrow")
    dash = ' stroke-dasharray="5,4"' if kind in ("unused", "failed") else ""
    out = [f'<path d="{e["d"]}" fill="none" stroke="{color}" stroke-width="{1.6 if kind=="accent" else 1.2}"{dash} marker-end="url(#{{P}}{marker})"/>']
    if e.get("label"):
        lx, ly = e["at"]
        out.append(label(lx, ly, e["label"], AMBER if kind == "accent" else (SILICON if kind == "unused" else DIM)))
    return "\n".join(out)


def legend(y, prefix, used, W=W):
    items = [("solid", DIM, "route taken · runs"), ("accent", AMBER, "the route most runs took"), ("unused", SILICON, "available, not used"), ("failed", SOFT, "tried, failed")]
    out = [f'<line x1="40" y1="{y-16}" x2="{W-40}" y2="{y-16}" stroke="{RULE}" stroke-width="0.8"/>',
           f'<text x="40" y="{y+8}" fill="{DIM}" font-size="10" font-family="{MONO}" letter-spacing="0.14em">LEGEND</text>']
    items = [i for i in items if i[0] in used]
    x = 160
    for kind, c, t in items:
        dash = ' stroke-dasharray="5,4"' if kind in ("unused", "failed") else ""
        out.append(f'<line x1="{x}" y1="{y+4}" x2="{x+32}" y2="{y+4}" stroke="{c}" stroke-width="1.4"{dash}/>')
        out.append(f'<text x="{x+44}" y="{y+8}" fill="{DIM}" font-size="12" font-family="{SANS}">{t}</text>')
        x += 260
    return "\n".join(out)


def svg(d, prefix, W=W, H=H, show_legend=True):
    defs = "".join(
        f'<marker id="{prefix}{mid}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="{c}"/></marker>'
        for mid, c in [("arrow", DIM), ("arrow-accent", AMBER), ("arrow-unused", SILICON), ("arrow-failed", SOFT)])
    body = "\n".join(edge(e) for e in d["edges"]).replace("{P}", prefix)
    body += "\n" + "\n".join(node(n) for n in d["nodes"])
    used = {"solid"} | {e.get("kind", "default") for e in d["edges"]} | {n["kind"] for n in d["nodes"]}
    body = d.get("under", "") + "\n" + body + "\n" + d.get("over", "")
    if show_legend:
        body += "\n" + legend(H - 32, prefix, used, W)
    return (f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="{prefix}title {prefix}desc" class="ap-route">\n'
            f'<title id="{prefix}title">{html.escape(d["title"])}</title>\n<desc id="{prefix}desc">{html.escape(d["desc"])}</desc>\n'
            f'<defs>{defs}</defs>\n{body}\n</svg>')


# ── Data ──────────────────────────────────────────────────────────────────────
A_Y = ROW[1]
mid = lambda r: r + NH // 2

BLENDER = dict(
    slug="route-blender", name="RouteBlender",
    title="Blender runs: the route the agents took",
    desc="Of 64 Blender runs, 61 first tried the system Python and failed without ifcopenshell; 52 then ran Blender's bundled Python directly and 45 ran scripts through blender -b -P (33 did both); every design was written by a numpy and ifcopenshell script, and no run called the Blender API or an MCP server.",
    nodes=[
        dict(x=COL[0], y=A_Y, kind="input", tag="ASKED", name="Blender 4.5", sub="64 runs"),
        dict(x=COL[1], y=ROW[0], kind="failed", name="System python3", sub="no ifcopenshell"),
        dict(x=COL[1], y=ROW[1], kind="step", name="Blender's python3.11", sub="Blender never starts"),
        dict(x=COL[1], y=ROW[2], kind="step", name="blender -b -P", sub="headless, script only"),
        dict(x=COL[2], y=ROW[1], kind="focal", tag="SCRIPT", name="numpy + ifcopenshell", sub="entity by entity"),
        dict(x=COL[2], y=ROW[2], kind="unused", tag="0 RUNS", name="bpy API · MCP", sub="scene, modifiers, Bonsai"),
        dict(x=COL[3], y=ROW[1], kind="output", tag="OUT", name="design.ifc", sub="64 of 64"),
    ],
    edges=[
        dict(kind="failed", d=elbow(240, 180, 360, mid(ROW[0]), 264), label="61 FIRST", at=(312, mid(ROW[0]))),
        dict(kind="accent", d=elbow(240, 200, 360, mid(ROW[1]), 264), label="52", at=(312, mid(ROW[1]))),
        dict(kind="default", d=elbow(240, 220, 360, mid(ROW[2]), 264), label="45", at=(312, mid(ROW[2]))),
        dict(kind="accent", d=f"M560 {mid(ROW[1])} H680"),
        dict(kind="default", d=elbow(560, mid(ROW[2]), 680, 216, 600)),
        dict(kind="accent", d=f"M880 {mid(ROW[1])} H1000", label="64", at=(940, mid(ROW[1]))),
    ],
)

COMPAS = dict(
    slug="route-compas", name="RouteCompas",
    title="COMPAS runs: the route the agents took",
    desc="Of 94 COMPAS runs, 35 imported nothing from COMPAS and 59 used only its geometry primitives; one geometry script per run computed the plates and wrote the IFC with raw ifcopenshell, and compas_ifc was used in no run. In the 10 task-F runs the same plates went to compas_timber, which wrote the BTLx: in 2 runs inside the same script, in 8 from a plate file the script left behind.",
    nodes=[
        dict(x=COL[0], y=A_Y, kind="input", tag="ASKED", name="COMPAS ecosystem", sub="94 runs"),
        dict(x=COL[1], y=ROW[1], kind="step", name="compas.geometry", sub="Vector, Point, Frame"),
        dict(x=COL[1], y=ROW[2], kind="step", name="No COMPAS import", sub="numpy only"),
        dict(x=COL[2], y=ROW[1], kind="focal", tag="SCRIPT", name="Plate geometry", sub="numpy, raw ifcopenshell"),
        dict(x=COL[2], y=ROW[2], kind="unused", tag="0 RUNS", name="compas_ifc", sub="installed, never used"),
        dict(x=COL[2], y=ROW[0], kind="step", name="compas_timber", sub="same plates, BTLxWriter"),
        dict(x=COL[3], y=ROW[1], kind="output", tag="OUT", name="design.ifc", sub="94 of 94"),
        dict(x=COL[3], y=ROW[0], kind="output", tag="OUT", name="design.btlx", sub="10 of 10 F runs"),
    ],
    edges=[
        dict(kind="accent", d=f"M240 {mid(ROW[1])} H360", label="59", at=(300, mid(ROW[1]))),
        dict(kind="default", d=elbow(240, 220, 360, mid(ROW[2]), 264), label="35", at=(312, mid(ROW[2]))),
        dict(kind="accent", d=f"M560 {mid(ROW[1])} H680"),
        dict(kind="default", d=elbow(560, mid(ROW[2]), 680, 216, 600)),
        dict(kind="accent", d=f"M880 {mid(ROW[1])} H1000", label="94", at=(940, mid(ROW[1]))),
        dict(kind="default", d=f"M780 160 V120"),
        dict(kind="default", d=f"M880 {mid(ROW[0])} H1000", label="10", at=(940, mid(ROW[0]))),
    ],
)

PY = dict(
    slug="route-py", name="RoutePy",
    title="Python runs: the route the agents took",
    desc="All 65 plain-Python runs wrote their design with numpy and ifcopenshell. 29 never reached past them; 36 tried to import scipy or trimesh, which the image does not have: 7 of those pip-installed them, 29 rewrote the step in numpy.",
    nodes=[
        dict(x=COL[0], y=A_Y, kind="input", tag="ASKED", name="Python", sub="numpy, ifcopenshell"),
        dict(x=COL[1], y=ROW[0], kind="failed", name="import scipy, trimesh", sub="not installed"),
        dict(x=COL[2], y=ROW[0], kind="step", name="pip install", sub="scipy, trimesh, rtree"),
        dict(x=COL[2], y=ROW[1], kind="focal", tag="SCRIPT", name="numpy + ifcopenshell", sub="entity by entity"),
        dict(x=COL[3], y=ROW[1], kind="output", tag="OUT", name="design.ifc", sub="65 of 65"),
    ],
    edges=[
        dict(kind="failed", d=elbow(240, 184, 360, mid(ROW[0]), 264), label="36", at=(312, mid(ROW[0]))),
        dict(kind="accent", d=f"M240 216 H680", label="29 · NOT NEEDED", at=(460, 216)),
        dict(kind="default", d=f"M560 {mid(ROW[0])} H680", label="7", at=(620, mid(ROW[0]))),
        dict(kind="default", d=f"M780 120 V160"),
        dict(kind="default", d=vh(460, 120, 680, 184), label="29 · NUMPY INSTEAD", at=(572, 184)),
        dict(kind="accent", d=f"M880 {mid(ROW[1])} H1000", label="65", at=(940, mid(ROW[1]))),
    ],
)

if __name__ == "__main__":
    out_html, out_astro = sys.argv[1], sys.argv[2]
    os.makedirs(out_html, exist_ok=True); os.makedirs(out_astro, exist_ok=True)
    for d in (BLENDER, COMPAS, PY):
        s = svg(d, d["slug"] + "-")
        page = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                f'<title>{html.escape(d["title"])}</title><style>body{{margin:0;background:{PAPER};padding:40px}} svg{{width:100%;height:auto;display:block}}</style></head>'
                f'<body>\n{s}\n</body></html>')
        open(os.path.join(out_html, d["slug"] + ".html"), "w", encoding="utf-8").write(page)
        astro = ("---\n// " + d["title"] + ". Generated by the diagram-design route generator;\n"
                 "// counts from the transcript scan of 2026-10-12 (all matrix runs).\n---\n\n" + s + "\n")
        open(os.path.join(out_astro, d["name"] + ".astro"), "w", encoding="utf-8").write(astro)
        print("wrote", d["slug"])
