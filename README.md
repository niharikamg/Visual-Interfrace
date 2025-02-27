

# County Data Visualization

## Overview

This project is an **interactive data visualization tool** that allows users to explore various socioeconomic and health-related attributes for US counties. It combines **D3.js, TopoJSON, and CSV data** to provide **interactive histograms, scatterplots, and a choropleth map** for meaningful data insights.

**Live Demo:** [Visual Interface](https://niharikamg.github.io/Visual-Interfrace/)

## Features

- **Choropleth Map**: Displays county-level data with color gradients.
- **Interactive Histograms**: Allows users to analyze the distribution of selected attributes.
- **Scatter Plot**: Visualizes the relationship between two selected attributes.
- **Dynamic Dropdowns**: Enables attribute selection for customized analysis.
- **Zoom and Pan on Map**: Users can explore specific regions interactively.
- **Tooltip Support**: Displays county-specific data on hover.

## Technologies Used

- **JavaScript (D3.js, TopoJSON)**
- **HTML & CSS**
- **Data Formats**: CSV (data.csv), JSON (counties-10m.json)

## File Structure

```
📂 County Data Visualization
├── index.html          # Main HTML structure
├── style.css           # Styling for charts and map
├── script.js           # Main logic for histograms and scatter plot
├── main.js             # Logic for updating choropleth map
├── choroplethMap.js    # Choropleth map class
├── topojson.v3.js      # TopoJSON library for handling geographical data
├── counties-10m.json   # US county-level TopoJSON file
├── data.csv            # Socioeconomic and health data
├── grey.jpg            # Background image
```

## How to Use

1. **Select Attributes**  
   - Choose different attributes from the dropdown menus.
   - The map, histograms, and scatter plot will update automatically.

2. **Interact with the Map**  
   - Hover over counties to see their details.
   - Zoom and pan using the mouse.

3. **Analyze Relationships**  
   - Use the scatter plot to compare two variables.
   - Identify patterns between socioeconomic and health factors.

## Setup Instructions

To run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/niharikamg/Visual-Interfrace.git
   ```
2. Open `index.html` in a web browser.

## Future Enhancements

- Additional data filters for enhanced exploration.
- More advanced statistical insights.
- Mobile-friendly UI improvements.



---

Let me know if you'd like any modifications! 🚀
