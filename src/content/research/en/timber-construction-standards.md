---
Cover: /assets/content/research/timber-construction-standards/timber-construction-standards-cover.svg
CoverAlt: "The designation DIN EN ISO 19650-1 broken into its parts: national body, European standard, international standard, and number and part."
CoverFit: contain
Description: "A systematic review of the ISO, GS1, CEN, DIN, SIA, KBOB and ÖNORM standards that govern how materials and multilayer buildups are specified in timber construction, from fire and building physics to BIM data templates and the digital product passport. Work package 1.2 of the DOKwood project."
Name: Standards for timber construction specifications
Tags:
  - Standards
  - Timber construction
  - Digital Product Passport
Authors:
  - Daniel Nunes Locatelli
Organization: Munich University of Applied Sciences
City:
  - Munich
Country: Germany
DateStart: "2025-02-01"
DateEnd: "2026-06-30"
Link:
  Text: DOKwood project page
  Href: /projects/dokwood
---

Before a platform can document timber buildups in a way that other companies and tools understand, someone has to answer a plain question: which standards define the words, the values and the tests? This work package of the [DOKwood](/projects/dokwood) project answered it for the German and Swiss timber industry, with Austria as the third leg of the DACH comparison. The result is a report that maps the landscape from international bodies down to cantonal fire regulations, and a proposed internal vocabulary anchored to governed standard terms.

## Method

The scope came from the industry partners. Gumpp & Maier and Schärholzbau named the bodies they answer to in practice: ISO and CEN, DIN, VDI and DIBt in Germany, SNV, SIA, KBOB and VKF in Switzerland. A benchmark of comparable platforms (Ubakus, Dataholz, Lignum Data) and a review of the partners' internal processes fixed the data granularity and the thematic domains worth covering.

The identification itself was systematic rather than anecdotal. ISO's International Classification for Standards (ICS) groups every standard into hierarchical domains, so instead of reading documents one by one the review walked the relevant ICS groups (79 Wood technology, 91 Construction materials and building, 13.220 Fire protection, and so on) and excluded the unrelated ones. European and national standards that ISO does not adopt were then searched through Nautos, the full-text platform DIN provides to Hochschule München, filtered by the same ICS codes and a consolidated keyword set spanning construction, material, environmental and documentation terms. Regional regulations (building codes, fire guidelines, procurement recommendations) were collected separately, since they are not standards but bind just as hard.

## Who writes the rules

The report devotes a chapter to the organisations, because their reach explains why the same topic can have three different documents in three countries. At the international level ISO and IEC produce voluntary standards that gain legal weight once regulations or contracts cite them, while GS1 provides the identification layer (GTIN, GLN, GS1 Digital Link) that links a physical product to its digital record. In Europe, CEN develops harmonised standards on mandate from the European Commission; applying one grants presumption of conformity with EU law, and national bodies must publish it and withdraw conflicting national standards.

Germany layers DIN, VDI guidelines and the DIBt, whose Muster-Holzbau-Richtlinie carries the fire and stability rules for timber into the state building codes. Switzerland adopts EN standards through SNV but delegates real authority to SIA norms, which mix technical and contractual requirements, to KBOB recommendations for public clients, and to the VKF fire regulations, which are legally binding. Austria harmonises through the OIB guidelines adopted by all nine states and keeps its own building physics series (ÖNORM B 8110, B 8115) and the baubook environmental database.

![Breakdown of a German standard designation, DIN EN ISO 19650-1, into its national, European and international parts.](../../../assets/content/research/timber-construction-standards/figure-1-german-standard-designation.png)

![Breakdown of a Swiss standard designation, SN EN ISO 19650-1, into its national, European and international parts.](../../../assets/content/research/timber-construction-standards/figure-2-swiss-standard-designation.png)

## Standards by domain

The core of the report groups the collected standards by what they govern:

- **Materials and products.** Intrinsic properties (fire reaction, acoustic, thermal, hygrothermal) and the product standards for timber and wood-based products, from EN 338 strength classes to EN 14080 glulam and EN 16351 cross-laminated timber.
- **Structural and fire design.** Eurocode 5 (EN 1995) with its national annexes, fire design by charring, and the mandatory national layers such as the MHolzBauRL and the VKF guidelines.
- **Buildup physics.** Fire resistance, airborne and impact sound, thermal transmittance and moisture for the assembled layer stack: DIN 4102, 4108 and 4109 in Germany, SIA 180 and 181 in Switzerland, EN ISO 6946 for U-values.
- **Technical communication.** Drawing representation, dimensioning and symbols, and construction documentation.
- **Digitalisation and data.** ISO 19650 information management, ISO 7817 level of information need, IFC, IDS, and the dictionary and data-template stack that underpins interoperable AEC software: ISO 12006-3 for the dictionary framework, ISO 23386 for governed property definitions, ISO 23387 for assembling properties into data templates.
- **Sustainability.** LCA under ISO 14040/14044, EPDs under EN 15804 and ISO 21930, and ISO 22057 for EPD data templates in BIM.

## The digital product passport

The most consequential finding concerns regulation rather than technique. The 2024 Construction Products Regulation (EU 2024/3110) entered into force in January 2025 and phases in a Digital Product Passport for construction products under harmonised standards, which puts construction among the first sectors affected. The DPP's technical architecture is being written by CEN/CENELEC JTC 24 as a series of pre-standards (prEN 18216 to 18246) covering data exchange, unique identifiers, data carriers, persistence, APIs, interoperability, access rights and data integrity, with GS1 identifiers as the expected technical foundation.

![Overview of the CPR-2024 timeframe: entry into force December 2024, date of application December 2025, mandatory declaration of all core environmental indicators December 2029. Source: European Commission.](../../../assets/content/research/timber-construction-standards/figure-3-cpr-2024-timeframe.png)

![CPR-2024 acquis timeline showing the priority order of product subgroups; subgroups 7, 16 and 18 are the ones relevant to DOKwood. Source: European Commission.](../../../assets/content/research/timber-construction-standards/figure-4-cpr-2024-acquis-timeline.png)

![Basic diagram of a digital product passport: a data carrier on the product resolves a unique identifier to a machine-readable record shared along the supply chain.](../../../assets/content/research/timber-construction-standards/figure-5-basic-dpp-diagram.png)

For prefabricated timber elements, which combine many products into one delivered component, the passport will have to synthesise material origin, LCA data, fire classifications and end-of-life instructions across disciplines. The Digital Building Logbook extends the same idea from product to building, with the Ecorys study for the European Commission as the reference framework and national variants such as the DGNB Gebäuderessourcenpass in Germany and a GS1-based Gebäudepass in Switzerland.

![Framework of the Digital Building Logbook from the Ecorys technical study for the European Commission.](../../../assets/content/research/timber-construction-standards/figure-6-dbl-ecorys-framework.png)

## What it means for DOKwood

Three conclusions carried into the rest of the project. First, structural design is harmonised under the Eurocodes, but fire, acoustics, thermal protection and LCA keep substantial national specificity, so a cross-border tool needs a data architecture that can store and validate against German and Swiss rules at once. Second, the partners' internal terminology diverged from the standard terms in ways that would undermine any machine-readable exchange, which is why the report ends with a proposed shared vocabulary anchored to ISO 12006-3, 23386 and 23387. Third, the DPP will arrive whether or not a company prepares for it, and a standards-aligned buildup record is the right substrate for one. That vocabulary is what became the [DOKwood bSDD data dictionary](/research/dokwood-bsdd-data-dictionary).
