/*

parameters and definitions for the view elements

*/


// View Parameters
// Specify the chart’s dimensions.
const chartWidth = 1800;
const chartHeight = 900;
let nextId = 0;

// Set the description window dimensions and offsets
const descripWidth = 600;
const descripHeight = 800;
const descripOffsetX = 10; // Offset the description window horizontally
const descripOffsetY = -100; // Offset the description window vertically

// Set the colors for different node types
const artColor = "#d69d69";
const locationsColor = "#93e18a";
const flairsColor = "#eaeb81";
const companiesIndividualsColor = "#a64d64";
const researchColor = "#5a7699";
const businessColor = "#7ea5d4";
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

let nodeLabels = svg.append("g")
    .selectAll("text")

const descripWindow = d3.select("body")
    .append("div")
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
    .style("max-height", `${descripHeight - 60}px`) // Subtract the height of the buttons from descripHeight
    .style("overflow", "auto") // Enable scrolling if content overflows
    .style("z-index", "100");

const editButton = descripWindow.append("button")
    .text("Edit")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .style("margin-top", "10px")
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
            const targetNodeName = descripWindow.attr('window-name');
            // Delete the node and its links
            data.links = data.links.filter(link => link.source.name !== targetNodeName && link.target.name !== targetNodeName);
            data.nodes = data.nodes.filter(node => node.name !== targetNodeName);
            // Update the graph
            updateLinkGraph(data.links);
            updateNodeGraph(data.nodes);
            updateNodeLabels(data.nodes);
            updateSimulation(data.nodes, data.links);
            simulation.restart();
            descripWindow.style("display", "none");
            // Update the local storage with updated data
            updateLocalStorage();

        }
    })

const closeButton = descripWindow.append("button")
    .text("Close")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        descripWindow.style("display", "none");
    });

const saveButton = descripWindow.append("button")
    .text("Save")
    .style("display", "none")
    .style("margin-left", "30px")
    .on("click", () => {
        const targetNode = data.nodes.find(node => node.name == descripWindow.attr('window-name'));
        if (targetNode) {
            updateNodeData(targetNode);
            updateLinkData(targetNode);

            updateLinkGraph(data.links);
            updateNodeGraph(data.nodes);
            updateNodeLabels(data.nodes);
            updateSimulation(data.nodes, data.links);
            simulation.restart();
            //updateFlairButtons(data.nodes);
            updateWindowAttr(targetNode);
            updateWindowDisplay("edit");
            updateLocalStorage();
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
    .style("width", `${chartWidth * 0.7}px`) // Set the width to 70% of chartWidth
    .style("height", `${chartHeight}px`)
    .style("z-index", "999");

const miscButtonsContainer = d3.select("body")
    .insert("block", "svg")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("top", "0")
    .style("left", `${chartWidth * 0.7}px`) // Set the left position to the width of the flairButtonsContainer
    .style("width", `${chartWidth * 0.3}px`) // Set the width to 30% of chartWidth
    .style("height", `${chartHeight}px`)
    .style("z-index", "999");

let flairButtons = flairButtonsContainer.selectAll("button")

const downloadButton = miscButtonsContainer.append("button")
    .text("Download Data")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => { downloadJSON() });

const createButton = miscButtonsContainer.append("button")
    .text("Create New Node")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => {
        addNodeWindow.style("display", "block");
        addNodeContent();
    });

const addNodeWindow = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("display", "none")
    .style("width", "800px")
    .style("height", "800px")
    .style("border", "1px solid #000")
    .style("border-radius", "5px")
    .style("background-color", "#fff")
    .style("z-index", "100")
    .style("top", "50%")
    .style("left", "50%")
    .style("transform", "translate(-50%, -50%)")
    .style("background-color", "#fff")
    .style("z-index", "200");

const newNodeContent = addNodeWindow.append("div")
    .style("padding", "10px")
    .style("word-wrap", "break-word")
    .style("max-width", "100%") // Set the maximum width to 100%
    .style("z-index", "200")
    .style("overflow", "auto");

const clearButton = miscButtonsContainer.append("button")
    .text("Clear Filter")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => {
        clearFlairFilter();
    });

const deleteFlairButton = miscButtonsContainer.append("button")
    .text("Delete Flair")
    .style("display", "inline-block")
    .style("margin-top", "5px")
    .style("margin-left", "5px")
    .style("pointer-events", "auto")
    .on("click", () => {
        if (lastClickedButton && window.confirm("Are you sure you want to delete the node '" + lastClickedButton + "'?")) {
            // Delete the node and its links
            data.links = data.links.filter(link => link.source.name !== lastClickedButton && link.target.name !== lastClickedButton);
            data.nodes = data.nodes.filter(node => node.name !== lastClickedButton);
            // Update the graph
            updateLinkGraph(data.links);
            updateNodeGraph(data.nodes);
            updateNodeLabels(data.nodes);
            updateSimulation(data.nodes, data.links);
            simulation.restart();
            clearFlairFilter();
            // Update the local storage with updated data
            updateLocalStorage();
        }
    });

const addNodeButton = addNodeWindow.append("button")
    .text("Add Node")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        updateNodeData(null);
        updateLinkData(null);
        updateLinkGraph(data.links);
        updateNodeGraph(data.nodes);
        updateNodeLabels(data.nodes);
        updateSimulation(data.nodes, data.links);
        simulation.restart();
        addNodeWindow.style("display", "none");
        updateLocalStorage();
    });

const addNodeCancelButton = addNodeWindow.append("button")
    .text("Cancel")
    .style("display", "inline-block")
    .style("margin-left", "10px")
    .on("click", () => {
        addNodeWindow.style("display", "none");
    });
