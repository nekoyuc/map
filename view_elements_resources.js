/*


parameters and definitions for the view elements


*/
// View Parameters
// Set the description window dimensions and offsets
const descripWidth = 800;
const descripHeight = 700;
const descripOffsetX = 10; // Offset the description window horizontally
const descripOffsetY = -100; // Offset the description window vertically


// Flair button container, including flair buttons, clear button, and create button
const flairButtonsContainer = d3.select("body")
    .append("div");

const flairButtons = flairButtonsContainer.selectAll("button")

const clearButton = flairButtonsContainer.append("button")
    .text("Clear")
    .style("pointer-event", "auto");

const createButton = flairButtonsContainer.append("button")
    .text("Create")
    .style("pointer-events", "auto");

// SVG container, including svg, rect, nodeGraph, linkGraph
const svg = d3.create("svg")

svg.append("rect")

let linkGraph = createLinkGraph();

let nodeGraph = createNodeGraph();

const descripWindow = d3.select("body")
    .append("div")
    .attr("id", null)
    .attr("name", null)
    .attr("window-id", null)
    .attr("window-name", null)
    .attr("window-url", null)
    .attr("window-type", null)
    .attr("window-description", null)
    .attr("window-author", null)
    .attr("window-location", null)
    .attr("window-flair", null)
    .style("position", "absolute")
    .style("display", "none")
    .style("width", `${descripWidth}px`)
    .style("height", `${descripHeight}px`)
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("background-color", "#fff")
    .style("z-index", "100")
    .attr("data-source", null);   // "new", "preview" or "edit"

const descripContent = descripWindow.append("div")

const editButton = descripWindow.append("button")

const deleteButton = descripWindow.append("button")

const saveButton = descripWindow.append("button")

const backButton = descripWindow.append("button")