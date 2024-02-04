/*

Functions for the controller

*/



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

function updateNodeData(node) {
    if (node !== null) {
        node.name = document.getElementById("name-input").value;
        node.type = document.getElementById("type-input").value;
        node.description = document.getElementById("description-input").value;
        node.url = document.getElementById("url-input").value;
    }
    else {
        data.nodes.push({
            "id": data.nodes.length,
            "name": document.getElementById("new-name-input").value,
            "type": document.getElementById("new-type-input").value,
            "description": document.getElementById("new-description-input").value,
            "url": document.getElementById("new-url-input").value
        });
    }
}

function updateLinkData(node) {
    const newAuthorNames = document.getElementById(node === null ? "new-authors-input" : "authors-input").value.split(", ");
    const newLocationNames = document.getElementById(node === null ? "new-locations-input" : "locations-input").value.split(", ");
    const newFlairNames = document.getElementById(node === null ? "new-flairs-input" : "flairs-input").value.split(", ");
    if (node !== null) { data.links = data.links.filter(link => !(link.target.id === node.id)) };
    targetNode = node === null ? data.nodes[data.nodes.length - 1] : node;

    newAuthorNames.forEach(authorName => {
        if (authorName.trim() === "") return;
        const newAuthorNode = data.nodes.find(node => node.name === authorName.trim() && node.type === "Companies/Individuals");
        if (newAuthorNode) {
            data.links.push({
                "source": newAuthorNode,
                "target": targetNode,
                "group": "___is the author of___"
            });
        } else if (window.confirm(`The author "${authorName.trim()}" does not exist. Do you want to create a new author?`)) {
            data.nodes.push({
                "id": data.nodes.length,
                "name": authorName.trim(),
                "type": "Companies/Individuals",
                "description": "",
                "url": ""
            });
            data.links.push({
                "source": data.nodes[data.nodes.length - 1],
                "target": targetNode,
                "group": "___is the author of___"
            });
        }
    });

    newLocationNames.forEach(locationName => {
        const newLocationNode = data.nodes.find(node => node.name === locationName.trim());
        if (newLocationNode) {
            data.links.push({
                "source": newLocationNode,
                "target": node,
                "group": "___is the location of___"
            })
        }
    });

    newFlairNames.forEach(flairName => {
        const newFlairNode = data.nodes.find(node => node.name === flairName.trim());
        if (newFlairNode) {
            data.links.push({
                "source": newFlairNode,
                "target": node,
                "group": "___is the flair of___"
            });
        }
    })
};

function updateLinkGraph(links) {
    linkGraph = linkGraph.data(links).join("line");
    linkGraph.enter().append("line").exit().remove()
    //linkGraph.attr("stroke-width", linkNormalWidth)
    //.attr("stroke-opacity", linkNormalOpacity)
    linkGraph.attr("stroke", d => {
        if (d.group === "___is the author of___") {
            return authorLinkColor;
        } else if (d.group === "___is the location of___") {
            return locationLinkColor;
        } else if (d.group === "___is the flair of___") {
            return flairLinkColor;
        } else {
            return otherLinkColor;
        }
    })
}

function updateNodeGraph(nodes) {
    nodeGraph = nodeGraph.data(nodes).join("circle");
    nodeGraph.enter().append("circle").exit().remove();
    //nodeGraph.attr("stroke", "#fff")
    //    .attr("stroke-width", 0.6)
    nodeGraph.attr("fill", d => {
        if (d.type === "Locations") {
            return locationsColor;
        } else if (d.type === "Architecture") {
            return architectureColor
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
    )
        .attr("r", d => d.type === "Flairs" ? flairNodeSize : (d.type === "Architecture" || d.type === "Visuals" || d.type === "Audio" ? projectNodeSize : topicNodeSize))
        .call(drag(simulation))
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
}

function updateSimulation(nodes, links) {
    simulation = simulation.nodes(nodes)
        .force("link", d3.forceLink(links).id(d => d.name).distance(100).strength(0.5));
}

function updateNodeLabels(nodes) {
    nodeLabels = nodeLabels.data(nodes)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.35em")
        .attr("font-size", d3.scaleLinear().domain([0, 1]).range([2, 4]).clamp(true)(1))
        //.attr("font-size", 20)
        .attr("font-family", "Futura Bk BT")
        .attr("font-weight", "bold")
        .attr("label-id", d => d.id)
        .text(d => d.name)
    //.style("display", "none")
}

function updateFlairButtons(nodes) {
    flairButtons = flairButtons.data(nodes)
        .join("button")
        .text(d => d.name)
        .attr("flair", d => d.name) // Set the name attribute to the node name
        .style("pointer-events", "auto")
        .style("margin-top", "5px")
        .style("margin-left", "5px") // Move the buttons down by 10px
        .on("click", flairClick);
}

function flairClick(d) {
    nodeGraph.attr("opacity", nodeNormalOpacity);
    linkGraph.attr("stroke-opacity", linkNormalOpacity);
    linkGraph.attr("stroke-width", linkNormalWidth);

    // If the button is clicked again, clear the filter
    if (d3.select(this).attr("flair") === lastClickedButton) {
        lastClickedButton = null;
    } else {
        const connectingLinks = linkGraph.filter(linkData => linkData.source.name === d3.select(this).attr("flair") || linkData.target.name === d3.select(this).attr("flair"));
        connectingLinks.attr("stroke-opacity", linkConnectedOpacity);
        connectingLinks.attr("stroke-width", linkConnectedWidth);

        const disconnectedLinks = linkGraph.filter(linkData => linkData.source.name !== d3.select(this).attr("flair") && linkData.target.name !== d3.select(this).attr("flair"));
        disconnectedLinks.attr("stroke-opacity", linkDisconnectedOpacity);

        const disconnectedNodes = nodeGraph.filter(nodeData => {
            const connectedNodes = connectingLinks.data().flatMap(linkData => [linkData.source, linkData.target]);
            return !connectedNodes.some(connectedNode => connectedNode.name === nodeData.name);
        });
        disconnectedNodes.attr("opacity", nodeDisconnectedOpacity);

        // Update the last clicked button icon
        lastClickedButton = d3.select(this).attr("flair");
    }
}

const zoom = d3.zoom()
    .on("zoom", zoomed);

function zoomed(event) {
    const { transform } = event;
    const mouseX = event.sourceEvent.clientX - chartWidth / 2;
    const mouseY = event.sourceEvent.clientY - chartHeight / 2;
    const scale = transform.k;
    const translateX = -mouseX * (scale - 1);
    const translateY = -mouseY * (scale - 1);
    //svg.attr("transform", `scale(${scale})`);
    svg.attr("transform", `translate(${translateX}, ${translateY}) scale(${scale})`);
    nodeLabels.style("display", d => transform.k >= nodeLabelDisplayExtent ? "block" : "none");
}

function updateWindowAttr(d) {
    descripWindow.attr("window-id", d.id);
    descripWindow.attr("window-name", d.name);
    descripWindow.attr("window-url", d.url);
    descripWindow.attr("window-type", d.type);
    descripWindow.attr("window-description", d.description);

    const connectingLinks = linkGraph.filter(linkData => linkData.source.id === d.id || linkData.target.id === d.id);
    const connectedNodes = [...new Set(connectingLinks.data().flatMap(linkData => [linkData.source, linkData.target]))];

    const authorNodes = connectedNodes.filter(nodeData => nodeData.type === "Companies/Individuals");
    const locationNodes = connectedNodes.filter(nodeData => nodeData.type === "Locations");
    const flairNodes = connectedNodes.filter(nodeData => nodeData.type === "Flairs");

    descripWindow.attr("window-author", authorNodes.map(nodeData => nodeData.name).join(", "));
    descripWindow.attr("window-location", locationNodes.map(nodeData => nodeData.name).join(", "));
    descripWindow.attr("window-flair", flairNodes.map(nodeData => nodeData.name).join(", "));
}

function clearWindowAttr() {
    descripWindow.attr("window-id", null);
    descripWindow.attr("window-name", null);
    descripWindow.attr("window-url", null);
    descripWindow.attr("window-type", null);
    descripWindow.attr("window-description", null);
    descripWindow.attr("window-author", null);
    descripWindow.attr("window-location", null);
    descripWindow.attr("window-flair", null);
}

function updateWindowDisplay(goal = "preview") {
    //    if (descripWindow.attr("data-source") == "new") {
    if (goal == "new") {
        displayWindowNew();
    } else if (goal == "preview") {
        //    } else if (descripWindow.attr("data-source") == "preview") {
        displayWindowPreview();
    } else if (goal == "edit") {
        //    } else if (descripWindow.attr("data-source") == "edit") {
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



function handleMouseOver(event, d) {
    descripToggle = false;
    updateWindowAttr(d);
    d3.select(this)
        .attr("r", d => d.type === "Flairs" ? hoveredFlairNodeSize : (d.type === "Architecture" || d.type === "Visuals" || d.type === "Audio" ? hoveredProjectNodeSize : hoveredTopicNodeSize))
        .attr("fill", "#808080");

    if (d.type !== "Flairs") {
        updateWindowDisplay("preview")
        descripWindow.style("display", "block")
            .style("left", `${event.clientX + 10}px`)
            .style("top", `${event.clientY + 10}px`);
        saveButton.style("display", "none");
        backButton.style("display", "none");
    };
}

function handleMouseOut(event, d) {
    d3.select(this)
        .attr("r", d => d.type === "Flairs" ? flairNodeSize : d.type === "Architecture" || d.type === "Visuals" || d.type === "Audio" ? projectNodeSize : topicNodeSize)
        .attr("fill", d => d.type === "Locations" ? locationsColor : d.type === "Architecture" ? architectureColor : d.type === "Flairs" ? flairsColor : d.type === "Companies/Individuals" ? companiesIndividualsColor : d.type === "Visuals" ? visualsColor : d.type === "Audio" ? audioColor : otherColor);

    simulation.restart(); // Resume the simulation

    if (!descripToggle) {
        descripWindow.style("display", "none");
    }
}
