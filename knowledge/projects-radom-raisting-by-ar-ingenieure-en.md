URL: https://daniellocatelli.com/projects/radom-raisting-by-ar-ingenieure

# Radom Raisting by AR Ingenieure

Description: Simulation of the deployment and collision avoidance for a 48.8m diameter inflatable radome protecting a parabolic antenna at the Raisting earth station.
Tags: Computational Design, Structural Analysis, Logistics, Grasshopper3D
Category: Membrane
Director: Alexander Hub
Team: Daniel Nunes Locatelli, Grant Galloway
Client: ITF Technical Fabrics GmbH
Organization: AR Ingenieure
Location: Raisting
Date: March 2021 - May 2021
Link: https://www.ar-ingenieure.com/projects/radom-raisting

The Raisting earth station in Bavaria, Germany, is home to several large parabolic satellite antennas. One of them needed a protective cover (a radome) to shield it from wind, rain, and snow. The client, ITF Technical Fabrics, approached AR Ingenieure with the engineering challenge: design an inflatable membrane dome that could be delivered by crane and deployed without colliding with the antenna it was meant to protect.

## The challenge

A radome of this scale (48.8 meters in diameter and 34 meters tall) is constructed as a pneumatically prestressed spherical membrane section. The membrane itself is fabricated from multiple panels sewn together, folded, and transported to site. The critical question was: how do you unfold a massive membrane around a delicate antenna without the fabric catching on the structure?

## Computational design

My role was to simulate the entire deployment sequence using Kangaroo Physics within the Rhino/Grasshopper environment. The simulation needed to model the membrane's behavior as it unfolded from a compact bundle into its final spherical shape, while continuously checking for collisions with the parabolic antenna underneath.

The simulation was run iteratively, testing different folding patterns and deployment speeds to find a sequence that avoided contact at every stage. Kangaroo's live physics engine was essential here: it allowed me to interactively adjust parameters and immediately see the effects on the membrane's behavior.

## On-site deployment

The actual deployment was a remarkable operation. The folded membrane was lifted by crane and suspended above the antenna. As it was lowered, the panels unfolded sequentially, following the pattern we had validated in the simulation.
