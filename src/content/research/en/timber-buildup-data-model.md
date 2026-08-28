---
Cover: /assets/content/research/timber-buildup-data-model/buildup-composition-cover.png
CoverAlt: "An oak tray laser-engraved 'External wall awmohi02a-04', a tested assembly from the dataholz catalogue, holding that wall's eight layers upright in numbered slots: larch cladding, battens, façade membrane, gypsum fibre sheathing, the stud zone, a solid glued timber panel, the service cavity and the inner lining. The stud zone and the service cavity are not single slabs: each slot holds a timber member, mineral wool and a second identical member one behind the other at the same thickness, so the layer reads as one depth of alternating materials. A printed legend beside the tray lists the eight layers by number with their thicknesses."
Description: "How a timber buildup becomes machine-readable: an ISO 23387 data model that nests layers and products inside a buildup, tightens a data template into a requirement sheet and satisfies it with a data sheet, published as the versioned hm/dokwood dictionary on bSDD and designed to carry DOKwood's Revit, Cadwork and MCP interfaces and a future digital product passport."
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
Updated: "2026-08-23"
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: hm/dokwood on the buildingSMART Data Dictionary
  Href: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13
OtherLinks:
  - Text: DOKwood project page
    Href: /projects/dokwood
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

The [DOKwood](/projects/dokwood) platform exchanges buildups with Revit, Cadwork and, eventually, AI assistants and a digital product passport. Every one of those exchanges is only as interoperable as the vocabulary beneath it: if "fire resistance class" means one thing in the platform, another in the Revit template and a third in the partner's PDF, nothing downstream can be trusted. The buildingSMART Data Dictionary (bSDD) is the industry's answer to that problem, a public, versioned registry of classes and properties with stable URIs that any tool can resolve. This page is about the dictionary I built there for DOKwood.

The dictionary is published under the Hochschule München organisation code as `hm/dokwood` and went through thirteen versions, v0.1 to v0.13, during my time there. Each tool that consumes it, such as the Revit add-in or the Cadwork plugin, gets its own group of properties, so a plugin can ask for exactly the bundle it needs.

![Two planes: the public bSDD dictionary with properties and classes above, and the DOKwood platform below, where each company composes its own data templates from them, projects tighten them into requirement sheets and fill data sheets, and the data sheet feeds the digital product passport.](/assets/content/research/timber-buildup-data-model/iso-23387-two-plane.svg "From the public dictionary to the digital product passport")

## ISO 23387 data templates

ISO 23387, the standard for data templates of construction objects, is the substrate of the whole data model: the company dictionary, the project store and, ultimately, the digital product passport all follow it, while the public dictionary rests on ISO 12006-3 for the dictionary framework and ISO 23386 for governed properties. A data template lists which properties describe a kind of object, without values. DOKwood uses two: a System Data Template for a buildup, because a buildup is a system of layers, and a Product Data Template for a product. The composition is nested: a buildup has layers as parts, and each layer has products as parts, both expressed with the standard's HasPart relation. Whether a layer needs its own template, to carry thickness, role or function, is an open question left for the next version.

![Left: Wall, Roof and Slab are kinds of Buildup, a System Data Template composed of layers and products, each product a Product Data Template. Right: a data template lists properties, a requirement sheet tightens them to required values, and a data sheet satisfies them with declared values.](/assets/content/research/timber-buildup-data-model/data-templates.svg "Composition of a buildup, and from template to sheet")

Modelling a whole assembly as a data template is still rare; most dictionaries stop at single products. Encoding the composition is where DOKwood goes a step further, and it is what allows the second half of the picture. The public dictionary offers the properties and classes. Each timber company composes its own data templates from them, a Schärholzbau external wall for instance, still without values. In a project, a requirement sheet fills that template with the values that are required (Rw at least 56 dB, REI 90), and a data sheet with the values that were declared or measured (Rw = 59 dB). ISO 23387 itself knows only the data template and the data sheet, and lets a data sheet represent a requirement as well as a product; requirement sheet is DOKwood's name for that first kind, kept apart because it is filled before anything is built. One nesting rule ties the chain together: generic contains requirement contains value. The filled data sheet of a fabricated buildup is precisely what a digital product passport carries.

![Three sheets with the same five properties: the data template leaves every value empty, the requirement sheet fills them with required values such as Rw at least 56 dB and REI 90, and the data sheet with declared values such as Rw 59 dB; arrows labelled tighten and satisfy link them.](/assets/content/research/timber-buildup-data-model/template-to-sheet.svg "Data template, requirement sheet and data sheet")

## Where it goes next

The goal that frames all of it is the Digital Product Passport, mandatory for construction products from around 2028 under the 2024 Construction Products Regulation and the ESPR. DOKwood's versioned, bSDD-described buildups are the right foundation, and the gap analysis I left behind lists what the platform still needs: an open property model where every value carries its version-pinned bSDD URI instead of two hard-coded physical quantities, persistent identifiers, a lean JSON-LD export as CIRPASS-2 recommends, lifecycle states from as-designed to as-built, verifiable certificates through the Document class, and a data carrier on the fabricated item. Most of that is foundational data-model work that pays off regardless of the passport, because it is the same work that makes the Revit, Cadwork and MCP interfaces reliable.

![A filled data sheet of a fabricated buildup, with values such as Rw 59 dB and REI 90, feeds a digital product passport that wraps those values with a persistent identifier, version-pinned bSDD URIs on every property, a document trail of certificates, datasheets and EPDs, a lifecycle state from as-designed to as-built, a data carrier on the item, and a JSON-LD export.](/assets/content/research/timber-buildup-data-model/data-sheet-to-dpp.svg "The data sheet feeds the digital product passport")
