---
Cover: /assets/content/projects/buildsystems-plugin-for-grasshopper/buildsystems-plugin-for-grasshopper-cover.png
CoverAlt: Grasshopper plugin developed for BuildSystems
Description: Plugin developed for BuildSystems to create building components based on Environmental Products Declarations (EPDs). The idea was to offer Lifecycle Analysis (LCA) data right at the beginning of the design process.
Name: BuildSystems plugin for Grasshopper
Tags:
  - Software Development
  - Grasshopper3D
Authors:
  - BuildSystems
Category: Software Development
DateStart: "2023-11-23"
Director:
  - Martin Bittmann
Team:
  - Daniel Nunes Locatelli
  - Daniel Dieren
Place: Online
---

During my time at BuildSystems, I led the development of a Grasshopper plugin aimed at streamlining the architectural design process. This toolset was created to allow users to parametrically define and analyze building designs, providing real-time feedback on material usage and environmental impact through integrated Life Cycle Assessment (LCA).

Key achievements of this development included:
- **Construction component detailing**: Functionality was implemented to define and manage individual building components with their associated material properties.
- **Integrated LCA analysis**: The plugin offered capabilities to quickly assess the environmental footprint of designs based on material data from Environmental Product Declarations (EPDs).
- **Data Management via JSON**: We created a structured JSON-based database to store and retrieve construction component data. This data structure was also planned to be used in a web app called *Circular Component Creator*, an idea that unfortunately never moved forward.
- **Intuitive Grasshopper Interface**: The plugin featured a user-friendly interface that leveraged Grasshopper’s visual programming paradigm, enabling smooth integration with existing workflows.

![BuildSystems tab in Grasshopper: LCA and urban planning components](../../../assets/content/projects/buildsystems-plugin-for-grasshopper/block-1f1bf53b-9ce3-80d3-b12f-e2eedb7a3eae.png)

## Challenges
There are two main languages used to develop Grasshopper plugins: Python and C#. However, for a more native look and feel, faster performance, and deeper integration C# is the preferred option. That’s because Grasshopper itself was written in C# by David Rutten.
The main challenge during this development was that McNeel, the company behind Rhino and Grasshopper, was in the middle of transitioning from *.NET Framework 4.8* to *.NET Core..*

### .NET Framework 4.8
- **Pros**
    - Still supported in Rhino 8
    - Compatible with earlier versions of Rhino/Grasshopper
    - Works with Rhino.Inside Revit, which still relies on .NET Framework
    - More learning resources available online, making debugging and development easier
- **Cons**
    - Being phased out, which would require migrating the plugin in the near future
    - Not cross-platform — separate plugins would be needed for Windows and macOS
    - Lower performance

### .NET Core
- **Pros**
    - Future-proof, as it's the base for upcoming Rhino/Grasshopper versions
    - Cross-platform support — one plugin works on both Windows and macOS
    - Higher performance
- **Cons**
    - Not compatible with older versions of Rhino/Grasshopper
    - Incompatible with the current version of Rhino.Inside Revit
    - Fewer resources and examples available online for development and debugging
McNeel recommends a [multi-targeting](https://learn.microsoft.com/en-us/nuget/create-packages/multiple-target-frameworks-project-file) approach — meaning the plugin should support both versions of .NET — which added an extra layer of complexity to the project.

## Looking ahead
The final stages of the project focused on establishing the **BuildSystems Object Model (BSoM)** to improve the plugin’s extensibility and maintainability.
Although fully functional, the project was eventually discontinued due to a shift in focus at the then-startup BuildSystems. At the time, the German economy was facing difficulties, and there were no active construction projects in which we could properly test the plugin. We chose to pivot and invest our time in developing a sustainable housing finance simulator tool instead.
