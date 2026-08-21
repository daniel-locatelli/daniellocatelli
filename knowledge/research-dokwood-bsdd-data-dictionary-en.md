URL: https://daniellocatelli.com/research/dokwood-bsdd-data-dictionary

# DOKwood bSDD data dictionary

Description: The hm/dokwood buildingSMART Data Dictionary: a versioned, machine-readable vocabulary for timber buildups and products, built on ISO 23387 data templates, published through bSDD, and designed as the semantic backbone for DOKwood's Revit, Cadwork and MCP interfaces and a future digital product passport.
Tags: bSDD, ISO 23387, Data templates, Timber construction
Authors: Daniel Nunes Locatelli, Fabian Scheurer, Sebastián Hernández-Maetschl, Joel Karolin
Organization: Munich University of Applied Sciences
Location: Munich
Date: February 2025 - June 2026
Link: https://identifier.buildingsmart.org/uri/hm/dokwood/0.13

The [DOKwood](/projects/dokwood) platform exchanges buildups with Revit, Cadwork and, eventually, AI assistants and a digital product passport. Every one of those exchanges is only as interoperable as the vocabulary beneath it: if "fire resistance class" means one thing in the platform, another in the Revit template and a third in the partner's PDF, nothing downstream can be trusted. The buildingSMART Data Dictionary (bSDD) is the industry's answer to that problem, a public, versioned registry of classes and properties with stable URIs that any tool can resolve. This page is about the dictionary I built there for DOKwood.

The dictionary is published under the Hochschule München organisation code as `hm/dokwood` and went through thirteen versions, v0.1 to v0.13, during my time there. Each tool that consumes it, such as the Revit add-in or the Cadwork plugin, gets its own group of properties, so a plugin can ask for exactly the bundle it needs.

## ISO 23387 data templates

ISO 23387, the standard for data templates of construction objects, is the substrate of the whole data model: the company dictionary, the project store and, ultimately, the digital product passport all follow it, while the public dictionary rests on ISO 12006-3 for the dictionary framework and ISO 23386 for governed properties. A data template lists which properties describe a kind of object, without values. DOKwood uses two: a System Data Template for a buildup, because a buildup is a system of layers, and a Product Data Template for a product. The composition is nested: a buildup has layers as parts, and each layer has products as parts, both expressed with the standard's HasPart relation. Whether a layer needs its own template, to carry thickness, role or function, is an open question left for the next version.

Modelling a whole assembly as a data template is still rare; most dictionaries stop at single products. Encoding the composition is where DOKwood goes a step further, and it is what allows the second half of the picture. The public dictionary offers the properties and classes. Each timber company composes its own data templates from them, a Schärholzbau external wall for instance, still without values. In a project, a requirement sheet fills that template with the values that are required (Rw at least 56 dB, REI 90), and a data sheet with the values that were declared or measured (Rw = 59 dB). ISO 23387 itself knows only the data template and the data sheet, and lets a data sheet represent a requirement as well as a product; requirement sheet is DOKwood's name for that first kind, kept apart because it is filled before anything is built. One nesting rule ties the chain together: generic contains requirement contains value. The filled data sheet of a fabricated buildup is precisely what a digital product passport carries.

## Where it goes next

The goal that frames all of it is the Digital Product Passport, mandatory for construction products from around 2028 under the 2024 Construction Products Regulation and the ESPR. DOKwood's versioned, bSDD-described buildups are the right foundation, and the gap analysis I left behind lists what the platform still needs: an open property model where every value carries its version-pinned bSDD URI instead of two hard-coded physical quantities, persistent identifiers, a lean JSON-LD export as CIRPASS-2 recommends, lifecycle states from as-designed to as-built, verifiable certificates through the Document class, and a data carrier on the fabricated item. Most of that is foundational data-model work that pays off regardless of the passport, because it is the same work that makes the Revit, Cadwork and MCP interfaces reliable.
