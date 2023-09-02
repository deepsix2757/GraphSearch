const svgAttr = {
    width: 1600,
    height: 800
};

const nodeAttr = {
    width: 80,
    height: 24,
    textColor: "#FFFFFF",
    boxFillColor: "#140DE0",
    boxOverColor: "#04E100",
    boxParentFillColor: "#78DE57",
    boxChildFillColor: "#23F529",
    boxSelectFillColor: "#EB2D20"
};

const edgeAttr = {
    strokeColor: "#140DE0",
    fillColor: "#140DE0"
};

// Create a new directed graph    
const g = new dagre.graphlib.Graph();

d3.select("#nodeId").on("input", () => {
    const val = document.getElementById("nodeId");
    val.value = val.value.toUpperCase();
    if(val.value){
        d3.select(".selectNode")
        .attr("class", "");
        
        d3.select("#" + val.value)
        .attr("class", "selectNode");
    }
});
  
d3.json("./data/links.json").then(function(data){
    // Set an object for the graph label
    g.setGraph({ directed: true, compound: true, multigraph: true });

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function() { return {}; });

    // Add nodes to the graph. The first argument is the node id. The second is
    // metadata about the node. In this case we're going to add labels to each of
    // our nodes.
    data.ids.forEach(d => {
        g.setNode(d.id, { label: d.id,  width: nodeAttr.width, height: nodeAttr.height });
    });
    
    // Add edges to the graph.
    data.links.forEach(d => {
        g.setEdge(d.from, d.to);
    });

    dagre.layout(g);

    console.log(g);

    // Add svg
    const svg = d3.select("#chart")
                  .append("svg")
                  .attr("width", svgAttr.width)
                  .attr("height", svgAttr.height);

    // Add arrow marker
    svg.append("svg:defs")
       .append("svg:marker")
       .attr("id", "triangle")
       .attr("refX", 8)
       .attr("refY", 4)
       .attr("markerWidth", 30)
       .attr("markerHeight", 30)
       .attr("markerUnits","userSpaceOnUse")
       .attr("orient", "auto")
       .append("path")
       .attr("d", "M 0 0 8 4 0 8 0 4")
       .style("fill", edgeAttr.fillColor);

    svg.append("svg:defs")
       .append("svg:marker")
       .attr("id", "triangle-select")
       .attr("refX", 8)
       .attr("refY", 4)
       .attr("markerWidth", 30)
       .attr("markerHeight", 30)
       .attr("markerUnits","userSpaceOnUse")
       .attr("orient", "auto")
       .append("path")
       .attr("d", "M 0 0 8 4 0 8 0 4")
       .style("fill", nodeAttr.boxOverColor);

    // Add nodes
    g.nodes().forEach(d => {
        svg.append("rect")
           .attr("class", "node")
           .attr("id", d)
           .attr("width", nodeAttr.width)
           .attr("height", nodeAttr.height)
           .attr("x", g.node(d).x)
           .attr("y", g.node(d).y)
           .attr("rx", "4")
           .attr("ry", "4")
           .attr("fill",  nodeAttr.boxFillColor)
           .attr("stroke",  nodeAttr.boxFillColor)
           .on("mouseover", () => {
                svg.select("#" + d)
                   .attr("fill", nodeAttr.boxOverColor)
                   .attr("stroke", nodeAttr.boxOverColor);
                g.neighbors(d).forEach(v => {
                    svg.select("#" + v)
                       .attr("fill", nodeAttr.boxChildFillColor)
                       .attr("stroke", nodeAttr.boxChildFillColor);
                });
                g.nodeEdges(d).forEach(v => {
                    svg.select("#" + v.v + "-" + v.w)
                       .attr("marker-end", "url(#triangle-select)")
                       .attr("stroke", nodeAttr.boxChildFillColor);
                });
           })
           .on("mouseout", () => {
                svg.select("#" + d)
                   .attr("fill", nodeAttr.boxFillColor)
                   .attr("stroke", nodeAttr.boxFillColor);
                g.neighbors(d).forEach(v => {
                    svg.select("#" + v)
                       .attr("fill", nodeAttr.boxFillColor)
                       .attr("stroke", nodeAttr.boxFillColor);
                });
                g.nodeEdges(d).forEach(v => {
                    svg.select("#" + v.v + "-" + v.w)
                       .attr("marker-end", "url(#triangle)")
                       .attr("stroke", nodeAttr.boxFillColor);
                });
            });

        svg.append("text")
           .attr("class", "nodeText")
           .attr("text-anchor", "middle")
           .attr("x", g.node(d).x + nodeAttr.width/2)
           .attr("y", g.node(d).y + nodeAttr.height/2 + 5)
           .text(d)
           .attr("fill", nodeAttr.textColor);
    });
    
    // line transformation function
    const lines = d3.line()
                    .x(d => d.x + nodeAttr.width/2)
                    .y(d => d.y + nodeAttr.height/2)
                    .curve(d3.curveBasis);
    // Add edges
    g.edges().forEach(d => {
        console.log("edges" + d.v);
        svg.append("path")
           .attr("class", "edge")
           .attr("id", ()=>{return d.v + "-" + d.w;})
           .attr("d", lines(g.edge(d).points))
           .attr("fill", "none")
           .attr("marker-end", "url(#triangle)")
           .attr("stroke-width", 1)
           .attr("stroke", edgeAttr.fillColor);
    });
});