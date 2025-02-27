let data;

// Load CSV and TopoJSON Data
Promise.all([
  d3.csv("data.csv"),
  d3.json('counties-10m.json')
]).then(loadedData => {
  data = loadedData;

  // Convert numeric values in CSV data
  data.forEach(d => {
    d.AirqualityValue = +d.AirqualityValue;
    d.SmokingValue = +d.SmokingValue;
    d.StrokeValue = +d.StrokeValue;
    d.PhysicalInactivityValue = +d.PhysicalInactivityValue;
    d.UnemploymentRateValue = +d.UnemploymentRateValue;
    d.PovertyValue = +d.PovertyValue;
    d.FoodStampValue = +d.FoodStampValue;
  });

  // Extract numeric columns from the data
  const attributes = Object.keys(data[0]).filter(key => !isNaN(data[0][key]) && key !== "cnty_fips");

  // Populate dropdowns for attribute selection
  const dropdown1 = d3.select("#attribute1");
  const dropdown2 = d3.select("#attribute2");
  const dropdown3 = d3.select("#attribute3");
  

  attributes.forEach(attr => {
    dropdown1.append("option").text(attr).attr("value", attr);
    dropdown2.append("option").text(attr).attr("value", attr);
    dropdown3.append("option").text(attr).attr("value", attr);
  });

  // Set default selections for the dropdowns
  dropdown1.property("value", "AirqualityValue");
  dropdown2.property("value", "SmokingValue");

  // Initial chart and map rendering
  updateCharts();
  updateChoroplethMap();

  // Event listeners for dropdown changes
  dropdown1.on("change", () => {
    updateCharts();
  });
  dropdown2.on("change", updateCharts);
  dropdown3.on("change",updateChoroplethMap());
}).catch(error => console.error(error));

// Function to update charts when dropdown values change
function updateCharts() {
  const attr1 = d3.select("#attribute1").property("value");
  const attr2 = d3.select("#attribute2").property("value");

  d3.select("#histogram1").html(""); // Clear previous charts
  d3.select("#histogram2").html("");
  d3.select("#scatterplot").html("");

  createHistogram(data, attr1, "#histogram1", attr1);
  createHistogram(data, attr2, "#histogram2", attr2);
  createScatterplot(data, attr1, attr2);
}

// Function to create histograms
function createHistogram(data, key, container, title) {
  const width = 400, height = 300, margin = {top: 20, right: 30, bottom: 40, left: 40};

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d[key]))
    .nice()
    .range([margin.left, width - margin.right]);

  const histogram = d3.histogram()
    .value(d => d[key])
    .domain(x.domain())
    .thresholds(x.ticks(20));

  const bins = histogram(data);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .selectAll("rect")
    .data(bins)
    .enter().append("rect")
    .attr("x", d => x(d.x0) + 1)
    .attr("width", d => x(d.x1) - x(d.x0) - 1)
    .attr("y", d => y(d.length))
    .attr("height", d => y(0) - y(d.length))
    .attr("fill", "steelblue");

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(title);
}

// Function to create scatterplot
function createScatterplot(data, xAttr, yAttr) {
  const width = 400, height = 300, margin = {top: 20, right: 30, bottom: 40, left: 40};
  const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d[xAttr]))
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d[yAttr]))
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => x(d[xAttr]))
    .attr("cy", d => y(d[yAttr]))
    .attr("r", 5)
    .attr("fill", "red")
    .attr("opacity", 0.6);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(`${xAttr} vs. ${yAttr}`);
}

// Function to update the choropleth map based on selected attribute
function updateChoroplethMap() {
  const selectedAttr = d3.select("#attribute3").property("value");

  // Load and update geoData with data from CSV
  geoData.objects.counties.geometries.forEach(d => {
    const matchingData = data.find(record => record.cnty_fips == d.id);
    if (matchingData) {
      d.properties.value = matchingData[selectedAttr];
    }
  });

  // Set map dimensions and projection
  const width = 960, height = 600;
  const projection = d3.geoAlbersUsa().scale(1280).translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  // Color scale based on the selected attribute's data
  const color = d3.scaleQuantize()
    .domain(d3.extent(geoData.objects.counties.geometries, d => d.properties.value))
    .range(d3.schemeBlues[9]);

  // Create SVG element for the map
  const svg = d3.select(".viz").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  // Draw counties
  svg.selectAll(".county")
    .data(geoData.objects.counties.geometries)
    .enter().append("path")
    .attr("class", "county")
    .attr("d", path)
    .style("fill", d => color(d.properties.value));

  // Add a legend for the choropleth map
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20, 20)");

  const legendWidth = 200;
  const legendHeight = 20;

  const legendScale = d3.scaleLinear()
    .domain(d3.extent(geoData.objects.counties.geometries, d => d.properties.value))
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale).ticks(5);

  legend.append("g")
    .attr("transform", "translate(0, 0)")
    .call(legendAxis);

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 5)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#gradient)");

  // Gradient for the legend
  const gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  gradient.selectAll("stop")
    .data(color.range())
    .enter().append("stop")
    .attr("offset", (d, i) => i / (color.range().length - 1))
    .attr("stop-color", d => d);
}
