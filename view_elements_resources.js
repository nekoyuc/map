/*

parameters and definitions for the view elements

*/


// View Parameters
// Specify the chart’s dimensions.
const chartWidth = 1800;
const chartHeight = 900;
let nextId = 0;

// Set the description window dimensions and offsets
const descripWidth = 800;
const descripHeight = 1000;
const descripOffsetX = 10; // Offset the description window horizontally
const descripOffsetY = -100; // Offset the description window vertically

// Set the colors for different node types
const architectureColor = "#d69d69";
const locationsColor = "#93e18a";
const flairsColor = "#eaeb81";
const companiesIndividualsColor = "#a64d64";
const visualsColor = "#5a7699";
const audioColor = "#7ea5d4";
const otherColor = "#a3a3a3";

// Set the node sizes
const projectNodeSize = 13;
const hoveredProjectNodeSize = 16;
const topicNodeSize = 10;
const hoveredTopicNodeSize = 13;
const flairNodeSize = 6;
const hoveredFlairNodeSize = 8;

// Set the colors for different link groups
const authorLinkColor = companiesIndividualsColor;
const locationLinkColor = locationsColor;
const flairLinkColor = flairsColor;
const otherLinkColor = otherColor;

// Set node and link flair styles
const nodeNormalOpacity = 1;
const nodeDisconnectedOpacity = 0.1;
const linkNormalOpacity = 0.4;
const linkNormalWidth = 2;
const linkDisconnectedOpacity = 0.1;
const linkConnectedOpacity = 0.7;
const linkConnectedWidth = 3;

// Set node label display extent
const nodeLabelDisplayExtent = 1.8;

// Set toggles
let descripToggle = false;
let lastClickedButton = null;

// SVG container, including svg, rect, nodeGraph, linkGraph
const svg = d3.create("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("viewBox", [-chartWidth / 2, -chartHeight / 2, chartWidth, chartHeight])
    .attr("style", "max-width: 100%; height: auto; position: absolute; top: 40; left: 60;")

svg.append("rect")
    .attr("x", -chartWidth / 2)
    .attr("y", -chartHeight / 2)
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("fill", "none");

let linkGraph = svg.append("g")
    .attr("stroke-width", linkNormalWidth)
    .attr("stroke-opacity", linkNormalOpacity)
    .selectAll("line")
    .data([{}])
//.style("stroke", d => { strokeByGroup(d) })

let nodeGraph = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.6)
    .selectAll("circle")
    .data([{}])
    .join("circle")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.6)
    .attr("r", 5)
    .attr("fill", "#000");
//.attr("fill", d => { fillByType(d) })
//.attr("r", d => { radiusByType(d) })

let nodeLabels = svg.append("g")
    .selectAll("text")

const descripWindow = d3.select("body")
    .append("div")
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

const descripContent = descripWindow.append("div")
    .style("padding", "10px")
    .style("word-wrap", "break-word")
    .style("max-width", "100%") // Set the maximum width to 100%
    .style("z-index", "100");

const editButton = descripWindow.append("button")
    .text("Edit")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        saveButton.style("display", "inline-block")
        backButton.style("display", "inline-block")
        updateWindowDisplay("edit");
    });

const deleteButton = descripWindow.append("button")
    .text("Delete")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        if (window.confirm("Are you sure you want to delete the node?")) {
            const targetNode = data.nodes.find(node => node.id === descripWindow.attr('window-id'));
            if (targetNode) {
                const targetNodeId = targetNode.id;
                data.links = data.links.filter(link => link.source.id !== targetNodeId && link.target.id !== targetNodeId);
                data.nodes = data.nodes.filter(node => node.id !== targetNodeId);
                updateLinkGraph(data.links);
                updateNodeGraph(data.nodes);
                updateNodeLabels(data.nodes);
                updateSimulation(data.nodes, data.links);
                simulation.restart();
                descripWindow.style("display", "none");
            }
        }
    })

const saveButton = descripWindow.append("button")
    .text("Save")
    .style("display", "none")
    .style("margin-left", "30px")
    .on("click", () => {
        const targetNode = data.nodes.find(node => node.id === descripWindow.attr('window-id'));
        if (targetNode) {
            updateNodeData(targetNode);
            updateLinkData(targetNode);
            updateLinkGraph(data.links);
            updateNodeGraph(data.nodes);
            updateNodeLabels(data.nodes);
            updateSimulation(data.nodes, data.links);
            simulation.restart();
            updateWindowAttr(targetNode);
            updateWindowDisplay("edit");
        }
    });

const backButton = descripWindow.append("button")
    .text("Back")
    .style("display", "none")
    .style("margin-left", "10px")
    .on("click", () => {
        updateWindowDisplay("preview");
        saveButton.style("display", "none")
        backButton.style("display", "none")
    });

// Flair button container, including flair buttons, clear button, and create button
const flairButtonsContainer = d3.select("body")
    .insert("block", "svg")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("top", "0")
    .style("left", "0")
    .style("width", `${chartWidth}px`)
    .style("height", `${chartHeight}px`)
    .style("z-index", "999");

let flairButtons = flairButtonsContainer.selectAll("button")

const clearButton = flairButtonsContainer.append("button")
    .text("Clear Filter")
    .style("position", "absolute")
    .style("top", "5px")
    .style("right", "100px")
    .style("pointer-events", "auto")
    .on("click", () => {
        nodeGraph.attr("opacity", nodeNormalOpacity)
        linkGraph.attr("stroke-width", linkNormalWidth)
        linkGraph.attr("stroke-opacity", linkNormalOpacity)
        lastClickedButton = null;
    });

const createButton = flairButtonsContainer.append("button")
    .text("Create New Node")
    .style("position", "absolute")
    .style("top", "5px")
    .style("right", "200px")
    .style("pointer-events", "auto");