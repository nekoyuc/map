/*

Functions for the controller

*/


const zoom = d3.zoom()
    .on("zoom", zoomed);

function zoomed(event) {

}

function createLinkGraph() {
    let linkGraph = svg.append("g")
        .selectAll("line")
        .join("line")
    return linkGraph;
}

function fillByType(d) {
    if (d.type === "Locations") {
        return locationsColor;
    } else if (d.type === "Architecture") {
        return architectureColor;
    } else if (d.type === "Flairs") {
        return flairsColor;
    } else if (d.type === "Companies/Individuals") {
        return companiesIndividualsColor;
    } else if (d.type === "Visuals") {
        return visualsColor;
    } else if (d.type === "Audio") {
        return audioColor;
    } else {
        return otherColor;
    }
}

function strokeByGroup(d) {
    if (d.group === "___is the author of___") {
        return authorLinkColor;
    } else if (d.group === "___is the location of___") {
        return locationLinkColor;
    } else if (d.group === "___is the flair of___") {
        return flairLinkColor;
    } else {
        return otherLinkColor;
    }
}

function radiusByType(d) {
    if (d.type === "Flairs") {
        return flairNodeSize;
    } else if (d.type === "Architecture" || d.type === 'Visuals' || d.type === 'Audio') {
        return projectNodeSize;
    } else {
        return topicNodeSize;
    }
}

function updateLinkGraph() {
    linkGraph = linkGraph.data(data.links).join("line");
    linkGraph.enter().append("line").exit().remove();
    linkGraph.attr("stroke-width", linkNormalWidth)
        .attr("stroke-opacity", linkNormalOpacity)
        .style("stroke", "#000");
}

function updateNodeLabels(nodes) {
    nodeLabels = nodeLabels.data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.35em")
        //.attr("font-size", d3.scaleLinear().domain([0, 1]).range([2, 4]).clamp(true)(1))
        .attr("font-size", 20)
        .attr("font-family", "Futura Bk BT")
        .attr("font-weight", "bold")
        .attr("label-id", d => d.id)
        .text(d => d.name)
        //.style("display", "none")
}

function updateNodeGraph() {
    nodeGraph = nodeGraph.data(data.nodes).join("circle");
    nodeGraph.enter().append("circle").exit().remove();
    nodeGraph.attr("stroke", "#fff")
        .attr("stroke-width", 0.6)
        .attr("r", 5)
        .attr("fill", "#000");
}

function updateDescripWindow() {
    if (descripWindow.attr("data-source") == "new") {
        displayWindowNew();
    } else if (descripWindow.attr("data-source") == "preview") {
        displayWindowPreview();
    } else if (descripWindow.attr("data-source") == "edit") {
        displayWindowEdit();
    }
}

function displayWindowNew() {
    let descripContentHtml = `
    <br><strong>Create A New Node</strong>
    <br><br><strong>Name:</strong> <input type="text" id="name-input" value="">
    <br><strong>Type:</strong> <input type="text" id="type-input" value="">
    <br><strong>Update description:</strong> <input type="text" id="description-input" value="">
    <br><strong>Update URL:</strong> <input type="text" id="url-input" value="">

    <br><br><strong>Update author:</strong> <input type="text" id="authors-input" value="">
    <br><strong>Update location:</strong> <input type="text" id="locations-input" value="">
    <br><strong>Update flairs:</strong> (separate flairs with ",") <input type="text" id="flairs-input" value="">
    `;
    return descripContent.html(descripContentHtml);
}

function displayWindowPreview() {
    // Set the description content to include "description"
    let descripContentHtml = `<strong>Description:</strong> ${descripWindow.attr("window-description") ? descripWindow.attr("window-description") : ""}`;
    // Set the description content to include "url" attributes if "url" exists
    if (descripWindow.attr("window-url")) {
        descripContentHtml += `<br><strong>URL:</strong> <a href="${descripWindow.attr("window-url")}" target="_blank">${descripWindow.attr("window-url")}</a>`;
        descripContentHtml += `<br><iframe src="${descripWindow.attr("window-url")}" width="100%" height=600px></iframe>`;
    }
    return descripContent.html(descripContentHtml);
}

function displayWindowEdit() {
    let descripContentHtml = `
    <strong>ID:</strong> ${descripWindow.attr("window-id")}
    <br><strong>Name:</strong> ${descripWindow.attr("window-name") ? descripWindow.attr("window-name") : ""}
    <br><strong>Type:</strong> ${descripWindow.attr("window-type") ? descripWindow.attr("window-type") : ""}
    <br><strong>Description:</strong> ${descripWindow.attr("window-description") ? descripWindow.attr("window-description") : ""}
    <br><strong>URL:</strong> ${descripWindow.attr("window-url") ? descripWindow.attr("window-url") : ""}
    <br><br><strong>Author:</strong> ${descripWindow.attr("window-author") ? descripWindow.attr("window-author") : ""}
    <br><strong>Location:</strong> ${descripWindow.attr("window-location") ? descripWindow.attr("window-location") : ""}
    <br><strong>Flairs:</strong> ${descripWindow.attr("window-flair") ? descripWindow.attr("window-flair") : ""}

    <br><br><strong>Update name:</strong> <input type="text" id="name-input" value="${descripWindow.attr("window-name") ? descripWindow.attr("window-name") : ""}">
    <br><strong>Update type:</strong> <input type="text" id="type-input" value="${descripWindow.attr("window-type") ? descripWindow.attr("window-type") : ""}">
    <br><strong>Update description:</strong> <input type="text" id="description-input" value="${descripWindow.attr("window-description") ? descripWindow.attr("window-description") : ""}">
    <br><strong>Update URL:</strong> <input type="text" id="url-input" value="${descripWindow.attr("window-url") ? descripWindow.attr("window-url") : ""}">

    <br><br><strong>Update author:</strong> <input type="text" id="authors-input" value="${descripWindow.attr("window-author")}">
    <br><strong>Update location:</strong> <input type="text" id="locations-input" value="${descripWindow.attr("window-location")}">
    <br><strong>Update flairs:</strong> (separate flairs with ",") <input type="text" id="flairs-input" value="${descripWindow.attr("window-flair")}">
    `;
    return descripContent.html(descripContentHtml);
}

function flairClick(d) {

}

function HandleMouseOver(event, d) {
    descripWindow.attr("data-source", "preview");
}

function HandleMouseOut(event, d) {

}
