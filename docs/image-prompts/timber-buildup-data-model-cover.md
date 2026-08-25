# Image prompt: cover for /research/timber-buildup-data-model

Prompt for Gemini (nano banana) to replace the interim cover.

**Current state.** The page temporarily reuses its own first inline figure,
`iso-23387-two-plane.svg`, as the cover (`CoverFit: contain`). That is a placeholder: a cover
that restates a figure the reader meets three paragraphs later. Replace it with the PNG below.

**Target file:** `buildup-composition-cover.png` in
`src/assets/content/research/timber-buildup-data-model/`. Then, in all three locale files
(`src/content/research/{en,pt,de}/timber-buildup-data-model.md`):

- set `Cover: /assets/content/research/timber-buildup-data-model/buildup-composition-cover.png`
- remove the `CoverFit: contain` line (a photoreal 16:9 wants the default `cover` fit)
- replace `CoverAlt` with a translation of the alt text at the bottom of this file
- delete the placeholder copy `src/assets/content/research/timber-buildup-data-model/iso-23387-two-plane.svg`
  (the `public/` copy stays, it is the inline figure)

## What went wrong in attempt 1

The first generation (`Gemini_Generated_Image_zbu3d0zbu3d0zbu3.png`, kept untracked for
reference) got the staging right and the substance wrong. Keep what worked, fix four things:

- **Keep** the upright specimen-rack composition. The brief originally asked for a flat exploded
  stack; the model stood the layers upright in a tray instead, and that is better. Every layer is
  legible at once and the tray genuinely encloses them.
- **Fix the nesting.** It was shown by tying a small tag to a big tag's string. Only one of the
  two pairs survived, and the other sub-tag read as a ninth sibling layer. The nesting is the
  entire point of the image, so it must be structural, not string-on-string. See the tray scheme
  below.
- **Fix the buildup.** The layer order was hygrothermally wrong. See the corrected spec below.
- **Fix the CLT.** It was drawn as solid sawn timber with growth rings and a knot. The
  cross-laminated edge faces the camera and must show orthogonal layers.
- **Fix the designation.** Attempt 1 was engraved `Exterior wall EW-03`, an invented code. The
  page argues for stable, resolvable identifiers; inventing one on its own cover undercuts that,
  and the house rule for this family is real designations only. Use the dataholz code.
- **No watermark.** Attempt 1 carried a sparkle glyph in the lower right.

## What went wrong in attempt 2

The second generation (`Gemini_Generated_Image_24kmvf24kmvf24km.png`, kept untracked) fixed all
of the above. The nesting, the layer order, the CLT lay-up and the left-aligned engraving are all
correct and must be preserved. What failed was the *typography*, and only the typography:

- **The code was misspelled.** The tray read `awmphi02a-04`, with a `p` where the `o` belongs. A
  near-miss of a real code is worse than an invented one, because a reader in the field will try
  to resolve it and fail. Hence the characterwise spelling below.
- **The tag lettering was mush.** At full resolution `Cladding`, `Battens`, `Membrane`,
  `Sheathing` and `Mineral wool 200` all had broken letterforms. They read as those words only at
  thumbnail size.
- **The tags were rotated again**, roughly 60°, for the second time despite an explicit rule
  against it. The instruction was not the problem: tags that dangle on a string twist, so the
  model twists the lettering to match. The staging had to change, not the wording. Hence the
  flat-on-the-desk tags below.
- **The strings crossed the engraving.** Tags hanging from a line along the front rail put three
  strings straight through the most important text in the frame.
- **The watermark came back**, again in the lower right.

## What went wrong in attempt 3

Laying the tags flat on the desk cured the rotation and caused two new problems, so the staging
changed again. The engraving on the big tray was fine; everything below is what to fix.

- **Flat tags are foreshortened.** Seen from a slightly elevated three-quarter angle, a card lying
  on a desk is compressed to a sliver. Upright-but-twisted and flat-but-squashed are two ways of
  losing the same text. The tags have to sit in the same plane as the material faces, which is the
  one plane in this scene that reads cleanly.
- **Flat tags lost their referent.** A card on the desk with a string disappearing under the rail
  reads as loose paperwork, not as a label belonging to a specific piece. Association by position
  is not enough; the tag has to touch the thing it names.
- **Flush-left on the small trays read as bad centering.** On a short rail, text set flush left
  with an inset margin looks like a failed attempt at centring, because the eye compares the small
  left inset against the large right gap. Left alignment only announces itself when something else
  shares the margin. Hence the two-line treatment on every tray below.

## What went wrong in attempt 4, and why the tags are gone

Clipping the cards to the pieces did not work either. That is three staging attempts spent on the
same object, and the pattern is now clear enough to act on: **a small card carrying small text,
placed on or near a specimen, has no good position in this frame.** Dangling, it twists. Flat, it
foreshortens. Clipped, it either floats free of its piece or hides the material it is supposed to
be naming. Ten of them also crowd a frame whose subject is a row of eight slabs.

So the per-piece label is abandoned rather than staged a fourth way. **The contents are named in a
printed legend beside the tray**, and the pieces themselves carry nothing but a small engraved
numeral.

This is not a retreat. A legend is what a real specimen rack, a real material board and a real
component data sheet all use, and it buys three things the tags never could:

- **One text block instead of ten.** The model has to render text well in exactly one place, and
  that place can be sized generously because it is not competing with a 24 mm larch board for
  space.
- **Nesting stated twice.** The physical nesting (small trays inside the big tray) is repeated in
  the legend as indentation: products sit indented under the layer that contains them. The image
  and its key say the same thing in two different notations, which is the page's whole argument
  about data templates.
- **The materials stay visible.** Nothing overlaps the specimens any more. The cladding looks like
  cladding, the mineral wool looks like mineral wool, and the CLT edge, which took two attempts to
  get right, is no longer half-covered by a kraft card.

## What went wrong in attempt 5

The fifth generation (`Gemini_Generated_Image_q60osgq60osgq60o.png`) is the closest yet and the
**tray is finished**: the eight layers are in the right order, the small trays sit inside the big
one at 5 and 7, the CLT edge shows its lay-up, the slot numerals `1` to `8` land in front of the
right slots, and the engraved code reads `awmohi02a-04` correctly for the first time, with the
letter `o` and a real hyphen. Preserve all of that.

The legend card failed, in a specific and fixable way.

- **The lines cascade instead of aligning.** Every line on the card starts further right than the
  one above it, in a continuous staircase. This wrecks the two things the card exists to do.
- **The numerals no longer match their names.** Because the eight numerals sit in a straight column
  while the twelve names run diagonally away from it, each numeral ends up beside the wrong line:
  `1` next to `Battens`, `4` next to `Stud zone`, `8` next to `Lining` with three lines drifting
  above it. A key that mislabels is worse than no key.
- **The nesting is invisible.** Indentation can only signal nesting if the unindented lines share a
  left edge. When every line is indented from its predecessor, the four product lines look exactly
  like the eight layer lines, and the one claim the cover exists to make is gone.
- **The card is tilted far past "a few degrees"**, maybe twenty-five, with enough perspective that
  the text shrinks front to back. The cascade may partly be the model drawing a rotated block of
  text and losing the shared margin along the way.
- **The watermark is back, and this time it cannot be cropped.** The sparkle glyph sits on the card
  itself, over `Batten 60 × 60`. In the earlier attempts it landed on empty desk in the lower right
  and could have been trimmed away; here it is inside the subject.
- **The tray's two engraved lines do not share a left margin.** `awmohi02a-04` hangs out to the
  left of `External wall` rather than starting on the same vertical. Minor next to the card, but it
  is the one thing the engraving still gets wrong.

The lesson is the same one the tags taught, one level up: **do not ask for a typographic effect,
ask for a geometry.** "Indent the products" is a typesetting instruction. "Three vertical alignment
lines, and every line on the card begins exactly on one of them" is a description of where things
are, which is what a renderer can actually satisfy.

## What went wrong in attempt 6, and the conclusion drawn from it

The sixth generation (`Gemini_Generated_Image_uphvbjuphvbjuphv.png`) took the geometry brief
seriously and got closer still. **The tray is now finished and should not be regenerated**: correct
layer order, small trays at 5 and 7, CLT lay-up, slot numerals in front of the right slots,
`awmohi02a-04` spelled correctly, and the two engraved lines finally starting on a shared left
margin. The card flattened towards the camera as asked.

The card itself failed again, and differently:

- **The layer names still cascade.** Column A, the numerals, came out as a genuinely straight
  column. Column B did not: `Cladding`, `Battens`, `Membrane`, `Sheathing`, `Stud zone` each start
  a step right of the one above.
- **The products landed on the wrong rows.** They were placed as a fourth band far to the right,
  with `Stud 60 × 200` and `Mineral wool 200` sitting level with `Membrane` and `Sheathing` rather
  than under `Stud zone`, and `Batten 60 × 60` and `Mineral wool 50` level with `Stud zone` and
  `CLT core` rather than under `Service cavity`. The card therefore states the nesting incorrectly,
  which is worse than omitting it.
- **A new typo.** `MIneral wool 200`, with a capital `I` in second position. The other three product
  lines are clean.
- **Unrequested rules.** A hairline was drawn across every row, running out well past the text to
  the card's edge, filling the right half of the card with empty ruled bands.

Six attempts, and every one has failed on a block of small text while succeeding on the object.
That is a stable result, not bad luck: the model builds convincing three-dimensional things and
cannot hold a twelve-row two-level table. Asking a seventh time is not a plan.

**Conclusion: stop asking the generator for the legend.** Photograph the tray alone and set the
legend ourselves. See the section below.

## Attempt 8 works, and what made it work

`Gemini_Generated_Image_ndlctcndlctcndlc.jpg`. Slots 5 and 7 are finally right: one slot each, a
timber member at the near end, mineral wool running back from it, a second member at the far end,
every piece the same thickness left to right, faces flush in two continuous planes. No sandwich
along the row, no laminations, no LVL. Slot 2 is three spaced sticks and reads as sticks. Slot 6
shows glue lines on its end grain, which is what solid glued wood actually looks like. Every
designation on the card is spelled correctly, and there is no watermark.

**The wording that did it** was the one that stopped naming materials as things and stopped
describing a pattern: *a panel made mostly of mineral wool with a solid timber end at each end*,
three regions, nothing repeating. Two related bans did the rest of the work: no word whose everyday
referent is a different building product (*striped*, *banded*, *layered*, *laminated* all name LVL
in a timber context), and no word that implies a separate object to be placed (*stud*, *slab*,
*batten*, *between*).

**What is still wrong**, both of them editor work rather than reasons to regenerate:

- the near member at 5 and at 7 stands about half the height of the wool beside it, so it reads as a
  stick set in front of the layer rather than framing let into it. Extend it upward to match the far
  member.
- on the card, the millimetre column is shifted down by one row, so 24 sits beside Battens. The card
  is being reset by hand anyway, which is what it is there for.

## The reliable route: photograph the tray, set the legend as vector

Generate the still-life **with the card still on the desk**, and replace its printed text
afterwards with real type set in vector or in an image editor.

The card is not dropped, it is demoted. It stays in the render as a **plate**: the model is good at
photographing a piece of card lying on a desk, with the right paper texture, the right shadow under
its near edge and the right fall of light across it, and that is genuinely hard to fake in a
compositing step. What it cannot do is set twelve rows of type on that card. So it supplies the
object and the lighting, and we supply the text on top.

That also means the card's printed content stops being a pass-or-fail criterion. It only has to be
close enough to look natural and to prove the block of text fits. What has to be right is the
card's **geometry**: where it sits, how big it is, how flat it lies, and whether its surface is
clean enough to paint over.

This folder already works this way for every other figure on the page:
`generate-two-plane.mjs`, `generate-data-templates.mjs`, `generate-template-to-sheet.mjs` and
`generate-data-sheet-to-dpp.mjs` all emit SVG from a script. A
`generate-buildup-legend.mjs` that draws the legend into the empty right third of the photograph is
the same pattern, and it settles every open defect at once:

- alignment, indentation and row pairing become arithmetic instead of a request;
- `Mineral wool 200` cannot acquire a capital `I`;
- `awmohi02a-04` is typed once, in a file, where it can be checked;
- the watermark has nothing to land on in that part of the frame;
- and the legend can be localised, since pt and de want `Revestimento` and `Bekleidung`, not
  `Cladding`, and no regeneration is needed to get them.

The prompt below therefore keeps the whole tray specification and replaces the legend card section
with an instruction to leave that space empty. The card specification is kept underneath it, marked
as superseded, in case the composite route is abandoned.

## Shared visual language

Sister cover: `timber-construction-standards/buildup-passport-cover.png`, the stamped passport,
which sits on `/research/timber-construction-standards`. The two pages are a sequence
(standards landscape → data model), so the covers must read as one family:

photoreal product still-life, slightly elevated three-quarter angle, soft diffused daylight from
the upper left, shallow depth of field, warm off-white / cream paper desk surface, no people, no
screens, no logos. Text short, real designations only, neutral sans-serif; never invent
paragraphs of text. 16:9 aspect.

## What the image has to say

The passport cover shows the *outcome*: a finished buildup with declared values, stamped and
carried into a product passport. This cover must show the *mechanism*, and specifically the one
claim the page makes about itself:

> Modelling a whole assembly as a data template is still rare; most dictionaries stop at single
> products. Encoding the composition is where DOKwood goes a step further.

So the subject is **nesting**: a buildup has layers as parts, each layer has products as parts,
both through ISO 23387's `HasPart` relation.

The image encodes that with **one rule, applied without exception**:

| Visual | Means |
|---|---|
| Laser-engraved into a wooden tray | a named container: the buildup, or a layer that has parts |
| A numbered slot in the tray | one layer of the buildup |
| Several pieces in one slot | that layer's products, which is what makes it a composite layer |
| An indented line in the legend | the name of whatever sits in that slot |

Engraved names are permanent and belong to the container; the container is the thing that has a
designation you could look up. The contents are named in a separate document, which is exactly
their status in a data template: not intrinsic to the box, but declared about it.

A reader who never reads the caption should still see: big engraved box → eight numbered things in
it → two of those things are themselves small engraved boxes with their own contents. The legend
then confirms it in words, with the indentation matching the boxes.

Avoid a cover built from the three sheets (template → requirement sheet → data sheet).
`template-to-sheet.svg` already carries that inline, and a cover that restates a figure is the
mistake this replacement exists to fix.

## The buildup (corrected, grounded in dataholz)

Attempt 1 placed the CLT outboard of an insulated stud cavity and added a vapour retarder inboard
of it. That inverts the wall: the mass timber ends up on the cold side, and the vapour control
ends up inboard of insulation. The two comparable tested assemblies on dataholz, `awmoho03a` and
`awmohi02a`, both put the CLT innermost and carry **no separate vapour retarder foil** — the CLT
is the airtight and vapour-control plane.

The wall pictured is therefore a real, tested assembly rather than a plausible composite:
**dataholz `awmohi02a`, variation 04**
(<https://www.dataholz.eu/en/components/external-wall/detail/kz/awmohi02a.htm>).
Variation 04 is the one whose stud-zone insulation is mineral wool, which is also what makes that
layer photogenic. It declares U = 0.15 W/(m²K), Rw (C;Ctr) 53 (-2;-8) dB and a total of 451.5 mm.
On fire, the version page reads **REI 60 from inside and outside**, with REI 90 from inside
available only if the lining is doubled to 2 × 12.5 mm gypsum fibre board, which variation 04 is
not. An earlier draft of this file said "REI 90 inside / 60 outside"; that was wrong. None of these
values appear on the cover; they are recorded so the image stays checkable.

**Verbatim source.** The version page
(<https://www.dataholz.eu/en/components/external-wall/version/kz/awmohi02a/nr/04.htm>) lists ten
rows, A to J, outside to inside:

| dataholz row | mm | Designation as printed |
|---|---|---|
| A | 24.0 | Larch wood external wall cladding |
| B | 30.0 | Spruce wood battens (30/50) |
| C | – | vapour-permeable membrane sd ≤ 0,3 m |
| D | 15.0 | Gypsum fibre board |
| E | 200.0 | construction timber (60/200; e = 625) |
| F | 200.0 | mineral wool [040; 11; <1000 °C] |
| G | 100.0 | Solid glued wood |
| H | 70.0 | battens (60/60) on resilient clips, e = 660 |
| I | 50.0 | mineral wool [040; 11; <1000 °C] |
| J | 12.5 | Gypsum plaster board type DF or gypsum fibre board |

**That table is exactly the problem this page is about.** It is ten flat sibling rows. Nothing in
it says that E and F are two materials occupying one 200 mm zone, or that H and I share one 70 mm
cavity; a reader has to infer it from the repeated thickness, and adding the rows up gives 701.5 mm
against a declared total of 451.5 mm. The composition is present in the numbers and absent from the
structure, which is precisely what an ISO 23387 `HasPart` model fixes.

So the cover does not copy dataholz's list. It **keeps dataholz's designations and thicknesses,
every one of them checkable against the table above, and supplies the hierarchy dataholz omits**:
ten rows become eight layers, two of which contain two products each. Same facts, one more level.

Eight layers, outside to inside. Use exactly these, in this order, with no substitutions:

| # | Layer | mm | Contents |
|---|---|---|---|
| 1 | Cladding | 24 | larch |
| 2 | Battens | 30 | spruce battens 30/50 |
| 3 | Membrane | – | vapour-permeable, sd ≤ 0.3 m |
| 4 | Sheathing | 15 | gypsum fibre board |
| 5 | **Stud zone** | 200 | `Construction timber 60/200, e = 625` **and** `Mineral wool 040, 200` |
| 6 | Solid timber panel | 100 | solid glued wood |
| 7 | **Service cavity** | 70 | `Battens 60/60 on resilient clips, e = 660` **and** `Mineral wool 040, 50` |
| 8 | Lining | 12.5 | gypsum fibre board |

Three corrections against earlier drafts of this file, all from the version page:

- **The battens are 30/50, a slim batten laid on edge**, not a wide board. Attempt 6 drew slot 2 as
  a broad flat plank, which is the wrong product entirely.
- **The service cavity is 70 mm, not 60**, its battens sit **on resilient clips** at e = 660, and
  the 50 mm mineral wool sits inside that 70 mm depth rather than filling it.
- **Layer G is "Solid glued wood", not "cross-laminated timber".** dataholz does not call this
  panel CLT on this page, so the cover must not either. See the note below.

**Layers 5 and 7 are the composite ones and get the nested trays.** They are the only two layers
dataholz specifies with more than one material, so they are the only ones that earn a container.
Every other layer is a single bare piece in a numbered slot. Do not turn the cladding into a tray:
one product, one slot.

**On layer 6.** An earlier note here said to draw a cross-laminated edge with visibly orthogonal
layers. dataholz's own designation for this row is `Solid glued wood`, which is a broader term: it
covers cross-laminated panels but does not commit to one. Since this whole cover rests on using
real designations, the panel is now named **`Solid timber panel`** and drawn as a glued-up solid
timber panel whose edge shows **glue lines between laminations**, without insisting those
laminations run crosswise. Do not state a layer count, do not draw a growth-ring bullseye or a
knot, and do not label it CLT anywhere.

## Ready to paste: layers exact, card as a plate

This is the live prompt. **Judge it on the layers.** The legend card stays in the frame and is
specified below, but its typography is expected to be imperfect and will be replaced afterwards,
per the section above, so misaligned rows or a stray capital on the card are not grounds to
regenerate. A wrong batten is.

**Why slot 2 keeps coming back as a panel.** Calling it slim, narrow, 30 by 50 or "not a board" has
failed every time, because the instruction is fighting the composition. Seven slabs stand in a rack
of board-shaped slots; a slot in that rack is a board-shaped hole, and a board-shaped hole gets
filled with a board. The description is not the lever.

Two things are the lever, and both are used below:

- **Show battens as several members with air between them.** A batten layer is not one stick, it is
  a field of sticks at a spacing. Three short battens standing on end with visible gaps cannot be
  read as a panel, in the way one lonely stick in a wide slot always can. This is the same device
  that already makes the cladding group at 1 read as boards rather than as one slab.
- **Point at the piece the model already gets right.** The 60/60 batten in the service-cavity tray
  at 7 has rendered as a convincing square stick in every attempt. Anchoring slot 2 to it,
  explicitly and by name, gives a target that exists in the same frame instead of an abstraction.

General rule for this image: **any layer made of linear members rather than sheets is drawn as more
than one member with gaps**, and **what fills the gaps is the second material of that layer**. In
the stud zone and the service cavity, dataholz lists a timber member and a mineral wool in the same
zone at the same depth. The wool sits between the studs, at their spacing; a stud and a wool slab
standing beside each other describes a wall that does not exist.

## The axis convention, which is what the last attempt got wrong

The row runs left to right, and **that direction is the thickness of the wall**. So for every piece
in this tray:

- its **left-to-right dimension is the layer's thickness in millimetres**, and nothing else in the
  picture carries that number;
- its front-to-back and vertical dimensions are display size only, and say nothing about the wall.

From which the rule follows: **variation between layers runs left to right, variation within a layer
runs front to back.** The stud-wool-stud sandwich ran the wrong way, along the thickness axis, which
reads as three consecutive layers of three different thicknesses instead of one layer of one
thickness made of alternating materials.

### First: "striped" is a banned word too

The stripe wording produced laminated veneer lumber. That is not a misreading, it is the obvious
one: stripes running down the face of a timber panel are what LVL, plywood and glulam look like, so
asking for a striped timber panel asks for an engineered timber panel, and the model supplied one.
Meanwhile the sandwich persisted.

Two lessons, both now folded into the wording below.

- **Never use a word whose everyday referent is a different building product.** *Striped*, *banded*,
  *layered* and *laminated* all name the same picture in timber, and it is the wrong picture.
- **Describe regions of one object, not a pattern on it.** A pattern is applied to a surface and can
  be repeated; a region is a part of the thing and cannot. "The two ends of this panel are timber
  and the rest of it is mineral wool" describes one object with three regions and nothing that
  repeats.

### Describe surface, not contents

Four wordings have now been tried and all four came back rotated. Every one of them named the
materials as things: *a stud*, *a slab of wool*, *a second stud*; *two battens with wool between
them*; *three pieces*; *a block containing*. Naming a material as a thing is an instruction to make
a thing, and the picture already has a place where things go, which is the row. Adding "front to
back" afterwards is asking for the objects to be created and then arranged, and only the first half
survives.

The way out is to stop talking about contents altogether.

**There are eight panels in this tray, one per slot, and they differ from each other in exactly two
ways: how thick they are, and what their face looks like.** That is the entire description of the
row. Six of the eight have a face of one uniform material. Two of them, at 5 and 7, have a face
that is **striped**: a narrow pale stripe at each edge and a broad yellow-green stripe filling the
middle.

Striped is a property of a surface, like grained, marbled, speckled or laminated. A striped board is
still one board, the way a plank with a dark heartwood streak is still one plank and the glued
panel at 6 is still one panel despite the glue lines across its edge. Nothing is inside a stripe and
nothing can be lifted out of one, so there is nothing to arrange and nothing to spread along the
row.

If the words *stud*, *slab*, *batten* or *between* appear in a description of slot 5 or slot 7, that
description is wrong. The correct vocabulary is *panel*, *face*, *stripe*, *edge*, *recessed*.

The stripes are also literally true, which is why this is not a trick. A panel sawn out of a
finished stud zone has a sawn face, and the face of framing cut at 625 centres is a narrow band of
timber, a wide band of insulation and a narrow band of timber. The picture and the wall agree.

## Fallback: composite the two faces, as with the card

If slots 5 and 7 come back wrong once more, stop regenerating and treat them the way the legend card
is already being treated. Ask for **plain mineral-wool panels** at 5 and 7, one uniform material
each and nothing else, which the model has drawn correctly since attempt 1, and add the timber ends
afterwards in the image editor.

This is a small job and a well conditioned one: both faces are flat, camera-facing rectangles under
even light, so a timber end is a narrow rectangle of wood texture matched to the sticks already in
the frame at 2, with the panel's own shading multiplied over it. Slot 7 additionally wants the wool
a few millimetres proud, which is a soft inner shadow along two edges.

The reasoning is the same as for the card. The generator supplies the object, the lighting and the
shadow; we supply the parts it will not stop rearranging. Seven wordings have failed on this one
detail, and the detail is two rectangles.

## The small trays are gone

They were also wrong, and for the same reason. A tray around the stud zone adds width in the
thickness direction, so it draws a 200 mm layer as something wider than 200 mm. The stud zone and
the service cavity occupy one slot each, exactly like the other six layers, because that is what a
layer of constant thickness is.

Nesting is still stated, three times over and more honestly than before:

- **a slot holding three pieces where every other slot holds one.** The big tray's dividers already
  make each slot a visible compartment, so a compartment with parts in it is the picture of
  `HasPart`, and it costs no extra width;
- **the legend's indentation**, where the product lines sit under entry 5 and entry 7 with no
  numeral of their own;
- **the numerals**, which index one slot to one legend entry no matter how many pieces are in it.

The engraved `Layer / Stud zone` and `Layer / Service cavity` rails go with the small trays. That
is no loss: those two names are already on the legend card, on the rows the numerals point at. The
only engraving left is the buildup's own designation and the eight numerals, which is the cleaner
rule anyway. **The tray is the only container that gets a name burned into it, because it is the
only one with a designation you could look up.**

> Photoreal still-life on a warm off-white paper desk, soft diffused daylight from the upper left,
> slightly elevated three-quarter view, shallow depth of field, 16:9. No watermark, no logo, no
> sparkle or signature glyph anywhere in the frame.
>
> A shallow open oak tray, about the size of a large cutlery drawer, sits on the left two thirds of
> the desk, seen from a three-quarter angle. A **single printed card lies flat on the desk in the
> right-hand third of the frame** (specified at the end). Nothing else is on the desk: no second
> card, no tools, no props, no loose paper. Inside the tray,
> eight pieces of building material stand upright on their long edge in a row, like tiles in a
> specimen rack, each separated by two or three centimetres of air. Left to right, outside of the
> wall to inside:
>
>  1. a group of vertical larch cladding boards, warm reddish-brown, lightly sawn, thin;
>  2. **three short spruce battens standing on end in the slot, spaced apart with clear air between
>     them, not one solid piece.** Each batten is a stick 30 by 50 millimetres in section, about the
>     thickness of a finger: **the same kind of squared stick as the 60/60 battens at position 7,
>     only slightly smaller in section.** They are members, not a sheet. **The three sticks stand one
>     behind the other, going back into the slot**, all 30 mm thick left to right, with clear air
>     gaps between them through which the tray floor is visible. **They occupy one slot between one
>     pair of dividers**, and are never spread out along the row as if they were separate layers.
>     Nothing about this slot may read as a board, a plank or a continuous panel;
>  3. a dark charcoal façade membrane, thin and slightly limp, held upright in a shallow slot;
>  4. a grey-beige gypsum fibre board, dense and matte, 15 mm;
>  5. **one panel, 200 mm thick, made mostly of mineral wool, with a solid timber end at each end.**
>     Picture a slab of yellow-green mineral wool with a square post of pale timber let in flush at
>     its left end and another at its right end, the two posts running the full height of the panel.
>     Almost the whole panel is wool; the timber ends are narrow, roughly a tenth of its length
>     each. Everything is flush: the timber and the wool make one continuous face with no gap, no
>     joint line and no shadow between them, and the panel's top edge and both side faces are flat
>     and unbroken, exactly like the plain panels at 4 and 8. **Only three regions across the whole
>     panel: timber, wool, timber. Nothing repeats.** This is not a laminated, veneered, plywood or
>     LVL panel and must show no repeated thin layers of any kind;
>  6. **a thick solid glued timber panel, 100 mm, the deepest piece in the row.** Its cut edge faces
>     the camera and shows fine glue lines between laminations, so it reads as an engineered panel
>     rather than a sawn baulk. No growth-ring bullseye, no knot, no bark;
>  7. **one panel, 70 mm thick, built the same way**: mineral wool with a solid timber end at each
>     end, three regions, nothing repeating. It is clearly thinner than the panel at 6 and thicker
>     than the boards at 4 and 8. One difference from 5: here the wool sits **slightly recessed**, a
>     few millimetres below the timber at either end, so a broad shallow dish runs across the middle
>     of the face. Again no laminations, no veneer, no repeated layers;
>  8. a light grey gypsum fibre board, 12.5 mm, thinner than the board at 4.
>
> Crisp trade-fair craftsmanship, clean-cut edges, no damage.
>
> **Check before finishing.** Count the objects standing in the tray. **There must be exactly ten**:
> a group of cladding boards at 1, three battens at 2, and **one panel in each of the six remaining
> slots**. Positions 5 and 7 are panels like any other; each is mostly mineral wool with a timber end at each
> end. Two ways they can be wrong: if either has become two or three separate items standing side by
> side, and if either shows repeated thin layers like plywood or LVL. Eight slots, eight layers, no
> tray inside the tray.
>
> **Nothing is attached to any piece.** No tags, no cards, no labels, no strings, no stickers.
>
> **Laser engraving.** The big tray's front rail carries two stacked lines burned into its outer
> face, dark chocolate-brown scorch on oak, small neutral sans-serif, **both lines starting on
> exactly the same left vertical**, with the `a` of the second line directly below the `E` of the
> first:
>
> ```
> External wall
> awmohi02a-04
> ```
>
> Spell the code exactly, lower case: **a, w, m, o, h, i, zero, two, a, hyphen, zero, four**. The
> fourth character is the letter **o**, not a `p` and not a zero. Plain baseline hyphen.
>
> On the narrow top face of the big tray's front rail, a single small engraved numeral in front of
> each slot, `1` through `8` left to right, same burn style.
>
> **The legend card.** One rectangular card of plain matte off-white stock lying flat on the desk in
> the right-hand third, occupying roughly a third of the frame's width, with a soft shadow under its
> near edge. **It lies almost square to the camera**, rotated no more than five degrees, with
> shallow perspective, so the last line prints at nearly the same size as the first. Do not stand it
> up, fan it, curl it or lift a corner.
>
> Its surface must be clean and evenly lit: no gloss hotspot, no glare patch, no crease, no
> shadow of the tray falling across it, and no watermark, sparkle or glyph printed anywhere on it.
> Leave a generous margin of blank card on all four sides of the text.
>
> The card is headed `External wall   awmohi02a-04` with a single thin rule beneath it, then a list
> of the eight layer names in the tray's order, numbered `1` to `8`, with the four product names
> indented under `Stud zone` and `Service cavity`, and millimetre figures at the right edge. **One
> rule only, under the heading: no rule between rows, no box, no border, no leader dots.**
>
> **Background**: the desk fades into soft cream bokeh. Palette limited to oak and larch-warm
> browns, mineral-wool yellow-green, gypsum grey and paper white. Flat, calm, editorial; no dramatic
> shadows, no lens flare.

## buildup-composition-cover.png

> Photoreal still-life on a warm off-white paper desk, soft diffused daylight from the upper
> left, slightly elevated three-quarter view, shallow depth of field, 16:9. **No watermark, no
> logo, no signature glyph, no sparkle or star mark anywhere in the frame, and in particular
> nothing of the kind printed on or overlapping the legend card.** The card carries the thirteen
> lines specified below and no other mark of any kind.
>
> **The object**: a shallow open oak tray, about the size of a large cutlery drawer, sitting on
> the desk and seen from a three-quarter angle. Inside it, eight slabs of building material stand
> upright on their long edge in a row, like tiles in a specimen rack or records in a crate, each
> separated by two or three centimetres of air so all eight are visible at once. Left to right,
> outside of the wall to inside:
>
>  1. vertical larch cladding boards, warm reddish-brown, lightly sawn texture, thin;
>  2. a single slim spruce batten, 30 by 50 in section, laid on edge so it reads as a narrow strip
>     of pale timber and not as a board;
>  3. a dark charcoal façade membrane, thin and slightly limp, held upright in a shallow slot;
>  4. a grey-beige gypsum fibre board, dense and matte;
>  5. a small nested tray (see below) holding one squared timber stud and one slab of yellow-green
>     mineral-wool batt standing side by side, the batt roughly three times the stud's width;
>  6. a thick solid glued timber panel, the deepest piece in the row — **its cut edge faces the
>     camera and shows fine glue lines between laminations**, so it reads as an engineered panel
>     rather than a sawn baulk. No growth-ring bullseye, no knot, no bark;
>  7. a second nested tray (see below) holding one square spruce batten, 60 by 60, and one thin
>     slab of mineral wool side by side, both shallower than the panel at 6;
>  8. a light grey gypsum fibre board, thinner than layer 4.
>
> Crisp trade-fair craftsmanship, clean-cut edges, no damage, no gaps in the material itself.
>
> **The two nested trays**: at positions 5 and 7, instead of a bare slab, a small shallow oak tray
> sits inside the big tray, made of the same wood, with low sides about a third the height of the
> material it holds. Its contents stand upright inside it exactly like the other layers. The small
> trays must be unmistakably *inside* the big one and made of the same material, so they read as
> the same kind of thing, one level down.
>
> **Laser engraving, the container names**: each tray carries its name burned into the outer face
> of its front rail — dark chocolate-brown scorch on oak, slightly rough-edged as a real laser burn
> is, small neutral sans-serif in caps-and-lower-case, **left-aligned and set flush to the left end
> of the rail** with a small inset margin, never centred and never justified.
>
> The big tray's front rail carries **two stacked lines, both flush left on the same left margin**,
> like a real product label:
>
> ```
> External wall
> awmohi02a-04
> ```
>
> The upper line is the smaller and lighter of the two; the lower line, the code, is the larger and
> is the single most important string in the image. **Both lines start on exactly the same
> vertical**: the `a` of `awmohi02a-04` sits directly below the `E` of `External wall`, neither
> hanging out to its left nor stepped in to its right. Make the front rail deep enough to hold both
> lines comfortably with the burn well inside the rail's edges.
>
> The code must be reproduced **exactly**, lower-case, as these characters in this order:
> **a, w, m, o, h, i, zero, two, a, hyphen, zero, four**. The fourth character is the letter **o**,
> not a `p` and not a zero. Use a plain hyphen on the baseline, not a raised dot, not an en dash.
> The trailing `04` keeps its leading zero.
>
> **The two small trays carry the same two-line treatment**, for the same reason a single short
> line cannot look deliberately left-aligned: a second line sharing the margin is what makes the
> margin visible. Same burn style, same flush-left margin, upper line smaller and lighter:
>
> ```
> Layer                     Layer
> Stud zone                 Service cavity
> ```
>
> The system is the same on all three trays: **the upper line says what kind of container this is,
> the lower line says which one it is.** `External wall` over its code, `Layer` over its name. Six
> engraved lines across three rails.
>
> **The slot numerals**: on the narrow *top* face of the big tray's front rail, directly in front of
> each of the eight slots, a single small engraved numeral, `1` through `8`, left to right, same
> burn style. These sit on a different face from the two-line label, so nothing crowds anything.
> They are single characters, which is the only text in this image that has never failed to render.
> The two small trays carry no numerals of their own; their contents are identified by sitting
> inside a numbered slot.
>
> **The legend card, the contents**: **nothing is attached to the specimens. No hang-tags, no
> clipped cards, no labels, no strings, no stickers anywhere on the materials or on the trays.** The
> eight pieces stand bare in their slots.
>
> Instead, a single printed card lies flat on the desk in the near foreground, to the right of the
> tray. Plain matte off-white card stock, a faint drop shadow, the kind of key that comes with a
> material sample board. **Make it large: it should occupy roughly a third of the frame's width, big
> enough that every line is comfortably legible.** It is the second subject of the photograph, not a
> detail in it.
>
> **The card lies almost square to the camera.** Rotate it no more than five degrees, and keep the
> perspective on it shallow, so its printed lines run very nearly horizontal across the frame and
> the last line is the same size as the first. Do not stand it up, do not fan it, do not curl it.
>
> The card is printed in a neutral dark-grey sans-serif, one line per entry, in this exact order:
>
> ```
> External wall   awmohi02a-04
>
> 1  Cladding                                            24
> 2  Battens                                             30
> 3  Membrane                                             –
> 4  Sheathing                                           15
> 5  Stud zone                                          200
>        Construction timber 60/200, e = 625
>        Mineral wool 040
> 6  Solid timber panel                                 100
> 7  Service cavity                                      70
>        Battens 60/60 on resilient clips, e = 660
>        Mineral wool 040                                 50
> 8  Lining                                            12.5
> ```
>
> The right-hand figures are millimetres and form a fourth alignment column, right-aligned on their
> last digit. A product line carries a figure only where it differs from its parent layer's depth,
> which is why `Mineral wool 040` has `50` under a 70 mm service cavity and nothing under the
> 200 mm stud zone. Do not add a `mm` unit to any row and do not add a units heading.
>
> **The alignment is the whole content of this card, so treat it as geometry, not as styling.** The
> card has exactly **three vertical alignment lines**, and every printed line begins precisely on
> one of them. Nothing on this card is centred, nothing cascades, and no line is offset from the
> line above it except by moving to one of these three verticals:
>
> - **Column A**, at the left margin: the eight numerals `1` to `8`, one under the other, their left
>   edges dead flush, forming a single straight column down the card. The heading `External wall`
>   also starts on this line.
> - **Column B**, a short step to the right: the eight layer names, `Cladding`, `Battens`,
>   `Membrane`, `Sheathing`, `Stud zone`, `Solid timber panel`, `Service cavity`, `Lining`, all
>   eight starting dead flush on this second vertical.
> - **Column C**, a clear step further right: the four product names,
>   `Construction timber 60/200, e = 625`, `Mineral wool 040`,
>   `Battens 60/60 on resilient clips, e = 660`, `Mineral wool 040`, all four starting dead flush on
>   this third vertical, and no numeral beside any of them.
> - **Column D**, at the right edge: the millimetre figures, right-aligned so their last digits form
>   a straight vertical.
>
> Every printed line sits on its own horizontal baseline, evenly spaced, all twelve baselines
> parallel. **Each numeral shares a baseline with its own layer name**: `5` is level with
> `Stud zone`, `6` is level with `Solid timber panel`, `8` is level with `Lining`. A numeral is never level
> with a product line, because product lines have no numerals; the two product lines under entry 5
> and the two under entry 7 leave Column A empty on their rows, which is exactly what makes the
> nesting visible.
>
> The heading sits slightly larger and is separated from the list by a **single** thin horizontal
> rule running the width of the text. That is the only rule on the card: attempt 6 drew a hairline
> under every row, running far past the text, and filled the right half of the card with empty ruled
> bands. No row rules, no leader dots, no box, no border. Beyond the twelve listed lines, their
> millimetre figures and the heading, nothing else is printed on the card.
>
> **Text legibility**: every string in the image runs horizontally and upright. No vertical,
> rotated, tilted or mirrored lettering anywhere. Letterforms must be clean and fully formed at full
> resolution, not merely suggested at thumbnail size; the legend is worth the space it takes
> precisely so this is achievable. No line hyphenates or wraps. The engraved breaks are fixed:
> `External wall` / `awmohi02a-04`, `Layer` / `Stud zone`, `Layer` / `Service cavity`. Never rebreak
> a line anywhere else.
>
> **Background**: the desk fades into soft cream bokeh, nothing else. Palette limited to oak and
> larch-warm browns, pale insulation beige, mineral-wool yellow-green, gypsum grey, printed dark grey and
> paper white. No red accent on this one, keep the red stamps as the passport cover's signature.
> Flat, calm, editorial; no dramatic shadows, no lens flare.

## Alternate (if the legend's twelve lines still render badly)

> Same scene, tray, engraving, numerals, lighting and eight-layer order, but shorten the legend to
> the two entries that carry the argument, set larger still:
>
> ```
> External wall   awmohi02a-04
>
> 5  Stud zone                                          200
>        Construction timber 60/200, e = 625
>        Mineral wool 040
> 7  Service cavity                                      70
>        Battens 60/60 on resilient clips, e = 660
>        Mineral wool 040                                 50
> ```
>
> Six listed lines plus the heading. The six plain layers then go unnamed in the image and are named
> in the alt text and caption instead, which is an acceptable trade: the nesting is what the cover
> has to carry, and entries 5 and 7 are the only two that show it.

## Alt text (en, translate for pt and de)

> An oak tray laser-engraved "External wall awmohi02a-04", the code of a tested assembly in the
> dataholz catalogue, holding that wall's eight layers standing upright side by side in numbered
> slots: larch cladding, battens, façade membrane, gypsum fibre sheathing, the stud zone, a solid
> glued timber panel, the service cavity and the inner lining. Two of the eight, the stud zone and
> the service cavity, are not single slabs: each slot holds a timber member, a slab of
> mineral wool and a second identical member standing one behind the other at the same thickness, so
> the layer reads as one depth of alternating materials. A printed legend beside the tray lists the
> eight layers by number with their thicknesses and indents those four products under the layers
> that contain them.
