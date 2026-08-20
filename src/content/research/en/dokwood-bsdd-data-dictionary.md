---
Cover: /assets/content/research/dokwood-bsdd-data-dictionary/iso-23387-two-plane.svg
CoverAlt: "Two planes: the public bSDD dictionary with properties and classes above, and the DOKwood platform with company data templates, requirement sheets, data sheets and the digital product passport below."
CoverFit: contain
Description: "The hm/dokwood buildingSMART Data Dictionary: a versioned, machine-readable vocabulary for timber buildups and products, built on ISO 23387 data templates, published through bSDD, and designed as the semantic backbone for DOKwood's Revit, Cadwork and MCP interfaces and a future digital product passport."
Name: DOKwood bSDD data dictionary
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
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: hm/dokwood on the buildingSMART Data Dictionary
  Href: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13
OtherLinks:
  - Text: DOKwood project page
    Href: https://daniellocatelli.com/projects/dokwood
---

The [DOKwood](/projects/dokwood) platform exchanges buildups with Revit, Cadwork and, eventually, AI assistants and a digital product passport. Every one of those exchanges is only as interoperable as the vocabulary beneath it: if "fire resistance class" means one thing in the platform, another in the Revit template and a third in the partner's PDF, nothing downstream can be trusted. The buildingSMART Data Dictionary (bSDD) is the industry's answer to that problem, a public, versioned registry of classes and properties with stable URIs that any tool can resolve. This page is about the dictionary I built there for DOKwood.

## The hm/dokwood dictionary

The dictionary is published under the Hochschule München organisation code as `hm/dokwood` and went through thirteen versions, v0.1 to v0.13, during my time there.

Two of those versions were driven by the interfaces: v0.12 closed the property surface the Revit add-in needs (layer function, core boundary, host category via IFC entity, material colour and hatch) and v0.13 closed the one the Cadwork plugin needs for element construction. Each tool gets its own group of properties, so a plugin can ask for exactly the bundle it consumes.

## ISO 23387 data templates

ISO 23387, the standard for data templates of construction objects, is the substrate of the whole data model: the company dictionary, the project store and, ultimately, the digital product passport all follow it, while the public dictionary rests on ISO 12006-3 for the dictionary framework and ISO 23386 for governed properties. A data template lists which properties describe a kind of object, without values. DOKwood uses two: a System Data Template for a buildup, because a buildup is a system of layers, and a Product Data Template for a product. A buildup is composed of layers and a layer of products, encoded as the standard's HasPart composition. Whether a layer needs its own template, to carry thickness, role or function, is an open question left for the next version.

![Left: Wall, Roof and Slab are kinds of Buildup, a System Data Template composed of layers and products, each product a Product Data Template. Right: a data template lists properties, a requirement sheet tightens them to required values, and a data sheet satisfies them with declared values.](/assets/content/research/dokwood-bsdd-data-dictionary/data-templates.svg)

Modelling a whole assembly as a data template is still rare; most dictionaries stop at single products. Encoding the composition is where DOKwood goes a step further, and it is what allows the second half of the picture. The public dictionary offers the properties and classes. Each timber company composes its own data templates from them (a Schärholzbau external wall) and tightens them into requirement templates (Rw at least 56 dB). In a project those become sheets: a requirement sheet says what is required, a data sheet says what was declared or measured, and one nesting rule ties the chain together: generic contains requirement contains value. The filled data sheet of a fabricated buildup is precisely what a digital product passport carries.

## Where it goes next

The next version, v0.14, was specified to closure but not yet built when I left. Its moves: collapse the twelve named buildup subclasses into one class per IFC entity (Wall, Roof, Slab, plus a generic Buildup); add an Environment model of boundary conditions (heated room, exterior air, ground) so a calculation engine can derive surface resistances and U-values per EN ISO 6946 and SIA 180; add the first HasPart composition chain; and add Document and Project classes, the former to attach certificates, datasheets and EPDs as the passport's document trail. In parallel the team decided to move from one rigid dictionary for everyone to a framework: a minimal, extensible core with each tenant owning its own catalog that references it, since Swiss and German law and per-company workflows differ. Today's dictionary becomes the starter catalog a new tenant forks.

The goal that frames all of it is the Digital Product Passport, mandatory for construction products from around 2028 under the 2024 Construction Products Regulation and the ESPR. DOKwood's versioned, bSDD-described buildups are the right foundation, and the gap analysis I left behind lists what the platform still needs: an open property model where every value carries its version-pinned bSDD URI instead of two hard-coded physical quantities, persistent identifiers, a lean JSON-LD export as CIRPASS-2 recommends, lifecycle states from as-designed to as-built, verifiable certificates through the Document class, and a data carrier on the fabricated item. Most of that is foundational data-model work that pays off regardless of the passport, because it is the same work that makes the Revit, Cadwork and MCP interfaces reliable.
