let data;

// Load CSV Data
d3.csv("data.csv").then(loadedData => {
    data = loadedData;

    // Convert numeric values
    data.forEach(d => {
        d.AirqualityValue = +d.AirqualityValue;
        d.SmokingValue = +d.SmokingValue;
        d.StrokeValue = +d.StrokeValue;
        d.PhysicalInactivityValue = +d.PhysicalInactivityValue;
        d.UnemploymentRateValue = +d.UnemploymentRateValue;
        d.PovertyValue = +d.PovertyValue;
        d.FoodStampValue = +d.FoodStampValue;
    });

    // Extract numeric columns
    const attributes = Object.keys(data[0]).filter(key => 
        !isNaN(data[0][key]) && key !== "cnty_fips"
    );

    // Populate dropdowns
    const dropdown1 = d3.select("#attribute1");
    const dropdown2 = d3.select("#attribute2");

    attributes.forEach(attr => {
        dropdown1.append("option").text(attr).attr("value", attr);
        dropdown2.append("option").text(attr).attr("value", attr);
    });

    // Set default selections
    dropdown1.property("value", "AirqualityValue");
    dropdown2.property("value", "SmokingValue");

    // Initial chart rendering
    updateCharts();

    // Event listeners for dropdowns
    dropdown1.on("change", updateCharts);
    dropdown2.on("change", updateCharts);
});

// Function to filter the data
function filterData(data, attr1, attr2) {
    return data.filter(d => 
        !isNaN(d[attr1]) && !isNaN(d[attr2]) &&  // Remove NaN values
        d[attr1] > 0 && d[attr2] > 0             // Remove zero/negative values
    );
}

// Function to update charts when dropdowns change
function updateCharts() {
    const attr1 = d3.select("#attribute1").property("value");
    const attr2 = d3.select("#attribute2").property("value");

    // Filter the dataset before visualization
    const filteredData = filterData(data, attr1, attr2);

    d3.select("#histogram1").html(""); // Clear previous chart
    d3.select("#histogram2").html("");
    d3.select("#scatterplot").html("");

    createHistogram(filteredData, attr1, "#histogram1", attr1);
    createHistogram(filteredData, attr2, "#histogram2", attr2);
    createScatterplot(filteredData, attr1, attr2);
}

// Create a tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "lightgray")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("display", "none")
    .style("pointer-events", "none");

// Function to Create Histograms with Tooltip
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

    const bars = svg.append("g")
        .selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`Range: ${d.x0.toFixed(2)} - ${d.x1.toFixed(2)}<br>Count: ${d.length}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });

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

// Function to Create Scatterplot with Tooltip
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
        .attr("opacity", 0.6)
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`<strong>County:</strong> ${d.display_name}<br>
                       <strong>${xAttr}:</strong> ${d[xAttr].toFixed(2)}<br>
                       <strong>${yAttr}:</strong> ${d[yAttr].toFixed(2)}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`${xAttr} vs. ${yAttr}`);
}
