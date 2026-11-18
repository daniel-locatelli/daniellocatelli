---
Cover: /assets/content/research/timber-buildup-data-model/buildup-composition-cover.png
CoverAlt: "An oak tray laser-engraved 'External wall awmohi02a-04', a tested assembly from the dataholz catalogue, holding that wall's eight layers upright in numbered slots: larch cladding, battens, façade membrane, gypsum fibre sheathing, the stud zone, a solid glued timber panel, the service cavity and the inner lining. The stud zone and the service cavity are not single slabs: each slot holds a timber member, mineral wool and a second identical member one behind the other at the same thickness, so the layer appears as one thickness of alternating materials. A printed legend beside the tray lists the eight layers by number with their thicknesses."
Description: "How a timber wall becomes data a computer can read: a public data dictionary on bSDD gives every fact one address, ISO 23387 data templates describe a whole buildup layer by layer, and requirement and data sheets prepare the wall for the EU digital product passport."
Name: A data model for timber buildups
Tags:
  - bSDD
  - ISO 23387
  - Data templates
  - Timber construction
Authors:
  - Daniel Nunes Locatelli
  - Fabian Scheurer
  - Sebastián Hernández-Maetschl
  - Joel Karolin
Organization: Munich University of Applied Sciences
City:
  - Munich
Country: Germany
Updated: "2026-11-17"
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: hm/dokwood on the buildingSMART Data Dictionary
  Href: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13
OtherLinks:
  - Text: DOKwood project page
    Href: /projects/dokwood
  - Text: The example wall, awmohi02a-04, on dataholz
    Href: https://www.dataholz.eu/en/components/external-wall/version/kz/awmohi02a/nr/04.htm
  - Text: ISO 23387:2025 data templates
    Href: https://www.iso.org/standard/85391.html
  - Text: ISO 23386:2020 properties in data dictionaries
    Href: https://www.iso.org/standard/75401.html
  - Text: ISO 12006-3:2022 object-oriented information framework
    Href: https://www.iso.org/standard/74932.html
  - Text: EN 17549-2:2023 configurable construction objects and requirements
    Href: https://standards.iteh.ai/catalog/standards/cen/d1d7f084-fe17-4e3e-bc06-b17a936ae485/en-17549-2-2023
  - Text: Regulation (EU) 2024/3110, Construction Products Regulation
    Href: https://eur-lex.europa.eu/eli/reg/2024/3110/oj/eng
  - Text: Regulation (EU) 2024/1781, Ecodesign for Sustainable Products (ESPR)
    Href: https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng
  - Text: CIRPASS-2 digital product passport pilots
    Href: https://cirpass2.eu/
---

The tray in the picture holds one real external wall, layer by layer: larch cladding, battens, a façade membrane, gypsum fibre board, timber studs with insulation between them, a solid timber panel, a service cavity of battens and insulation where cables and pipes run, and the inner lining. It is a tested wall from dataholz, the Austrian online catalogue of timber building components, where it is listed as awmohi02a-04. Walls like this are usually built in a factory as whole elements and delivered to the site ready to install, so the wall itself is a product. A carpenter reads it at a glance. A computer cannot, unless every layer and every fact about it (how thick it is, how much sound it lets through, how long it holds out in a fire) has a name that means the same thing in every program that touches the wall.

Take fire. Every building code asks how long a wall must keep doing its job when the building burns: keep carrying the floors above it, keep the flames on one side, and keep the other side cool enough for people to get out. Engineers call this the wall's fire resistance and measure it in minutes, by building a sample of the wall and burning it in a test furnace. The answer is a number of minutes, but each standard writes it its own way. The older German standard, DIN 4102-2, calls a 90-minute wall "F90". The European standard, EN 13501-2, writes "REI 90", with one letter per job: R for carrying the load, E for keeping the flames back, I for keeping the far side cool. A Brazilian project simply states the required time, 90 minutes. To a person, these look like the same fact; they are close, though not identical, as we will see. To a computer, "F90", "REI 90" and "90 min" are three unrelated pieces of text. When the architect's model, the manufacturer's product sheet and the builder's software each write it their own way, the information stops flowing between them: a fire check that looks for one of them simply finds nothing it recognises, and usually nobody notices.

The fix is to agree, once, on what each fact means, and to write that down where every program can look it up. Such a list is called a data dictionary. Each entry describes one property of a building element: its name, a precise definition, the kind of value it takes (a number, a piece of text, yes or no), and a web address that always means this one property. A program that stores the address, not just the name, knows exactly which property is meant, whatever the label on screen says. This is the entry for the European fire resistance class in the dictionary this article describes, with its definition quoted as written:

| Field      | Entry                                                                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name       | Fire Resistance EN 13501-2                                                                                                                                                               |
| Definition | The period of time, expressed in minutes, during which a building element satisfies the specified fire resistance performance criteria when tested under standardized fire exposure conditions |
| Value      | Text: the class, which contains the minutes, such as REI 90                                                                                                                              |
| Address    | `https://identifier.buildingsmart.org/uri/hm/dokwood/0.13/prop/FireResistanceEN13501-2`                                                                                                  |

The same dictionary has a second entry, with its own address, for the German F90 class. It does not merge the two: the German and the European fire tests differ in their details, so a wall rated in one is not automatically rated in the other. So the dictionary does not turn F90 into REI 90. What it removes is the guessing: every program that means the European class points to one entry, and every program that means the German class points to the other.

A dictionary can also link to other dictionaries. Take ETIM, the classification behind many product catalogues: manufacturers describe what they sell in its terms, so that building-material dealers and online shops can list and compare products from different makers side by side. ETIM defines both fire classes too, and each entry here carries an "is equal to" link to its ETIM twin. A program can then check a fire-rated board from a catalogue against the fire class a wall needs, without anyone copying values by hand.

![Two data dictionaries side by side. This article's dictionary, hm/dokwood, has one entry for the European fire resistance class EN 13501-2, with the example value REI 90, and a separate entry for the German class DIN 4102-2, with the example value F90; the two are kept apart because the fire tests differ. The ETIM dictionary, used by manufacturers and dealers, has its own entries for the same two classes. Each entry has its own web address, and an arrow labelled is equal to links each entry to its ETIM twin.](/assets/content/research/timber-buildup-data-model/dictionaries-linked.svg "One fact, two dictionaries, linked")

Both dictionaries live in the same public place, the buildingSMART Data Dictionary (bSDD). It is run by buildingSMART International, the non-profit organisation behind IFC, the shared file format BIM programs use to exchange models. Standards bodies, industry groups and universities publish their dictionaries there, which is why every address in this article starts with `identifier.buildingsmart.org`: a person can open it in a browser, and a program can ask bSDD for the same entry. Once a version of a dictionary is released, its entries stay fixed; changes go into a new version with new addresses, while the old addresses keep working, so a value a model pointed to years ago still means what it meant then. The dictionary this article describes is published there as `hm/dokwood`: `hm` is the code of the Munich University of Applied Sciences, where I built it, and DOKwood is the research project it was built for, a web platform where timber companies define and exchange their buildups. It went through thirteen versions; the latest is version 0.13.

## From properties to data templates

Properties are only half of a dictionary. The other half is classes: the kinds of things the properties describe. The central one here is the buildup, the complete layered assembly of a wall, floor or roof. External Wall, Internal Wall, Floor and Pitched Roof are all kinds of buildup, and two further classes, Layer and Product, describe what a buildup is made of. A class says what a thing is; its properties say what can be known about it. A list of properties that describes one class, with no values filled in, is called a data template, a term from ISO 23387, the international standard this work follows. A data template is a form with empty fields: it says which questions to ask about every external wall, not the answers for any particular one. The dictionary offers 19 properties for External Wall, from how much heat the wall lets through to how much sound, and each timber company picks the ones it needs into its own template for the walls it makes.

A template also says what a thing is made of. Look at the tray again: the wall is a stack of eight layers. The template for a buildup lists its layers as parts, and the template for a layer lists the products inside it; ISO 23387 calls this link "has part". Some layers are a single product, a board or a membrane. The stud zone is not. It is one layer in which materials alternate along the wall: a timber stud, mineral wool, then the same timber stud again, every 625 mm. A drawing shows the stud zone as one band of 200 mm; the data has to say that the band is made of two products and record the pattern they repeat in. The service cavity works the same way, with battens instead of studs. This is where a timber wall stops being a simple stack. Most dictionaries describe single products only; describing a whole buildup, including layers like these, is what this work adds.

![The external wall from the cover as data. The wall, a buildup, has eight layers as parts, from outside to inside: larch cladding, battens, façade membrane, gypsum fibre board, stud zone, solid timber panel, service cavity and inner lining. The stud zone in turn has parts in a pattern that repeats every 625 mm along the wall: timber stud, mineral wool, timber stud. The mineral wool points to one product; both timber studs point to the same timber stud product. The service cavity follows the same pattern and is not drawn.](/assets/content/research/timber-buildup-data-model/composition.svg "A wall has layers; a layer has products")

## From template to sheet

A template on its own describes no wall in particular. A project uses it twice. First, before anything is built, the project fills the template with what it requires, for example: sound insulation of at least 50 decibels (how much quieter it is behind the wall), fire resistance of at least 60 minutes, a heat loss of at most 0.20 (lower is better), a wall no thicker than 460 mm. That filled form is a requirement sheet. Then the same template is filled with the values of the wall that is actually built, declared by its maker or measured in a test. For the wall in the tray, dataholz publishes them: 53 decibels; 90 minutes for a fire from inside the building and 60 minutes from outside, since an external wall is tested from both sides; a heat loss of 0.15; 451.5 mm. That is a data sheet. Because both sheets come from one template and point to the same dictionary addresses, a program can lay them side by side and check, row by row, whether the wall meets the requirement. This one does.

![Three sheets with the same five properties: sound insulation, fire resistance, heat loss, thickness and cladding. The data template, made by a timber company, has empty value fields. Both sheets below it are filled from that template: the requirement sheet of a project, with required values such as sound insulation at least 50 dB and fire resistance at least REI 60, and the data sheet of the wall as built, with 53 dB, REI 90 from inside and REI 60 from outside, a heat loss of 0.15 and 451.5 mm. An arrow labelled checked against links the data sheet to the requirement sheet.](/assets/content/research/timber-buildup-data-model/template-to-sheet.svg "Data template, requirement sheet and data sheet")

## The digital product passport

All of this prepares for a new obligation. The European Union's new rules for construction products, in force since 2025, introduce a digital product passport: a machine-readable record of what a product is and how it performs, which stays with the product from the factory into the building. The passport is not required yet: it starts once the European Commission publishes the detailed rules it is still writing, and manufacturers then have 18 months to comply. For a prefabricated timber wall, the core of that passport already exists: it is the data sheet of the wall as built. The passport adds what makes the sheet trustworthy for decades: a unique ID for the wall, the documents that prove its values, whether the wall is still a design or already built, and a tag on the wall, a QR code or a radio chip (RFID), that opens the passport when scanned. And because every value already points to a dictionary entry whose address keeps its meaning, the passport can still be read correctly long after the programs that wrote it are gone.

![The data sheet of the wall as built, with values such as sound insulation 53 dB and fire resistance REI 90 from inside, feeds a digital product passport, which keeps those values, each already linked to its dictionary entry, and adds a unique ID, the proof behind them (certificates, test reports, environmental data), the wall's stage from designed to built, and a tag on the wall, a QR code or RFID chip, that opens the passport when scanned.](/assets/content/research/timber-buildup-data-model/data-sheet-to-dpp.svg "The data sheet feeds the digital product passport")

The tray at the top of this page is a kind of data sheet too, made of oak: one wall, layer by layer, with a printed legend of what each layer is and how thick. A person reads it in seconds. What this work adds is a description of the same wall that a computer reads just as easily, so that its facts travel from the architect's model to the factory, the building site and the passport without anyone typing them in again.

## For specialists

_The rest of this page is for readers who work with these standards._

The data model follows ISO 23387:2025 for data templates and data sheets. The dictionary rests on two neighbouring standards: ISO 12006-3:2022, the framework for object-oriented dictionaries that bSDD implements, and ISO 23386:2020, the method for describing, authoring and maintaining properties in interconnected dictionaries. For exchange through IFC files, EN 17549 is one option: its first part covers data templates and configured products, and its second, EN 17549-2:2023, defines an IFC model view, CODview2, that adds requirements as checkable rules, configurable products and formulas that software can run, with every value pointing to its definition in a dictionary compliant with ISO 12006-3. CODview2 is a subset of IFC 4 (EN ISO 16739-1:2020) and predates IFC 4.3; the templates and the dictionary do not depend on the IFC version. ISO 23387 applies a data template to single object types and to systems alike, and illustrates the "has parts" relationship with a stud wall and its cladding; a buildup template is that case worked out for timber. The standard defines a data sheet as data input that represents a real-world product, asset or requirement, and has no separate term for the last case; "requirement sheet" is this work's name for it, kept apart because it is filled before anything is built. The nesting runs from generic template to requirement to value.

In bSDD terms, External Wall, Pitched Roof, Floor and the other buildup types are subclasses of Buildup, and each references its IFC counterpart (Wall, Roof, Slab, Covering) through a HasReference relation; Layer and Product are classes of their own. Composition, the HasPart chain from buildup to layer to product, lives in the data templates rather than in bSDD's class relations. Links to other dictionaries are property relations of type IsEqualTo, as with the two fire resistance properties and their ETIM 10.1 twins. Properties are gathered into groups: by topic for buildups and products (acoustics, fire protection, moisture protection, structure, sustainability, thermal protection), and separately into groups only one consuming tool needs, so the Revit add-in, the Cadwork plugin and DOKwood's MCP interface for AI assistants can each ask for exactly their set. The dictionary went through thirteen versions, from v0.1 to v0.13, the last one public on bSDD.

The example wall's values come from the dataholz version page for awmohi02a-04: Rw (C; Ctr) = 53 (-2; -8) dB, U = 0.15 W/(m²K), REI 90 from inside and REI 60 from outside as classified by Holzforschung Austria (in Germany REI 60 from both sides, REI 90 from inside only with a doubled lining), and 451.5 mm across the eight layers. The requirement values are an illustrative project.

For the passport, the dictionary is a foundation, not the whole building. Several pieces still have to sit on top of it: every value in a data sheet pinned to a versioned dictionary URI rather than to a property name; a persistent identifier for each fabricated buildup; a lean JSON-LD export, as recommended by [CIRPASS-2](https://cirpass2.eu/), the EU project piloting digital product passports; lifecycle states from as-designed to as-built; verifiable certificates; and a data carrier on the item. Most of that is the same data-model work that makes the BIM and fabrication interfaces reliable, so it pays off whether or not the passport arrives on schedule.
