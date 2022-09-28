const margin = {
    top: 10,
    right: 0,
    bottom: 20,
    left: 30
}

const width = 900;
const height = 800;

// tooltip
const tooltip = d3.select("#chart")
                .append("div")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("background-color", "#d3d3d3")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")

const mouseover = function(e) {
    tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "black")
        .style("cursor", "crosshair")
}

const mousemove = function(e) {
    tooltip
        .html(
            `<strong>${e.toElement.__data__.rate}%<br>
            ${e.toElement.__data__["properties"]["NAME"]}</strong>`
        )
        .style("left", `${e.pageX + 20}px`)
        .style("top", `${e.pageY}px`)
}

const mouseleave = function(e) {
    tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
}

const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

const path = d3.geoPath();
const projection = d3.geoMercator()
            .scale(600)
            .center([15, 55])
            .translate([width / 2, height / 2]);

let data = new Map()



const colorScale = d3.scaleThreshold()
  .domain([0, 1, 3, 5, 8, 10, 15, 20, 30])
  .range(d3.schemeBlues[9]);

const colorLog = d3.scaleLog()
                .domain([1, 3, 5, 8, 10, 15, 20, 30])
                .range(d3.schemeBlues[9])
                
  Promise.all([
    d3.json("https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson"),
    d3.csv("europe_unemp.csv", function(d) {
        data.set(d["country"], d["rate"])
    })
  ]).then(function(loadData) {
    let topo = loadData[0]
    console.log(topo.features)
    // console.log(data)

    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .join("path")
            .attr("d", d3.geoPath()
                .projection(projection))
            .attr("fill", function (d) {
                d.rate = data.get(d["properties"]["NAME"]) || 0;
                return colorScale(d.rate)
            })
            .on("mousemove", mousemove)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
  })

svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(50, 300)`)

// let legend = d3.legendColor()
//             .labelFormat(d3.format(".2f"))
//             .labels(d3.legendHelpers.thresholdLabels)
//             .useClass(true)
//             .scale(colorScale)
            
let legend = d3.legendColor()
            .cells([0, 1, 2, 4, 6, 8, 10, 14, 16, 20, 25, 30])
            .scale(colorLog)

svg.select(".legend")
  .call(legend)