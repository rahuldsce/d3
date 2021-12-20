import React from 'react';
import * as d3 from 'd3';
const dataset = require('./flare-2.json')
const width = 932;
const radius = width / 6

const arcVisible = (d) => {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}

const labelVisible = (d) => {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

const labelTransform = (d) => {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
}

const partition = data => {
    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    return d3.partition()
        .size([2 * Math.PI, root.height + 1])
        (root);
}
class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id='chart' style={{ width: 600 }}></div>
            </React.Fragment>
        );
    }



    sunburstDiagram = () => {
        function graph(selection) {
            selection.each(function (data, i) {

                const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, dataset.children.length + 1))
                const format = d3.format(",d")
                // define arcs
                var arc = d3.arc()
                    .startAngle(d => d.x0)
                    .endAngle(d => d.x1)
                    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                    .padRadius(radius * 1.5)
                    .innerRadius(d => d.y0 * radius)
                    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

                const clicked = (event, p) => {
                    parent.datum(p.parent || root);


                    root.each(d => d.target = {
                        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                        y0: Math.max(0, d.y0 - p.depth),
                        y1: Math.max(0, d.y1 - p.depth)
                    });

                    const t = svg.transition().duration(750);

                    path.transition(t)
                        .tween("data", d => {
                            const i = d3.interpolate(d.current, d.target);
                            return t => d.current = i(t);
                        })
                        .filter(function (d) {
                            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                        })
                        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                        .attrTween("d", d => () => arc(d.current));

                    label.filter(function (d) {
                        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
                    }).transition(t)
                        .attr("fill-opacity", d => +labelVisible(d.target))
                        .attrTween("transform", d => () => labelTransform(d.current));
                }

                const root = partition(dataset);

                // root.each(d => d.current = d);

                // define SVG element
                var svg = d3.select("#chart").append("svg")
                    .attr("viewBox", [0, 0, width, width])
                    .style("font", "10px sans-serif")
                    .append("g") // append g element
                    .attr("transform", `translate(${width / 2},${width / 2})`)

                // redraw(root);
                var path = svg.append("g")
                    .selectAll("path")
                    .data(root.descendants().slice(1))
                    .join("path")
                    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
                    .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 0.6 : 0.4) : 0)
                    .attr("d", d => arc(d));

                path.filter(d => d.children)
                    .style("cursor", "pointer")
                    .on("click", clicked)
                    // .on('mouseover', function (e, d) {
                    //     var sequenceArray = d.ancestors().slice().reverse();
                    //     sequenceArray.shift();
                    //     svg.selectAll("path")
                    //         .transition()
                    //         .duration(200)
                    //         .style("opacity", d => sequenceArray.indexOf(d) >= 0 ? 1 : 0.3);
                    // })
                        // .on('mouseleave', function (e, d) {
                        //     svg.selectAll("path")
                        //         .transition()
                        //         .duration(200)
                        //         .style("opacity", 1);
                        // })

                path.append("title")
                    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

                const label = svg.append("g")
                    .attr("pointer-events", "none")
                    .attr("text-anchor", "middle")
                    .style("user-select", "none")
                    .selectAll("text")
                    .data(root.descendants().slice(1))
                    .join("text")
                    .attr("dy", "0.35em")
                    .attr("fill-opacity", d => +labelVisible(d))
                    .attr("transform", d => labelTransform(d))
                    .text(d => d.data.name);
                // .style('font-size', 14);

                const parent = svg.append("circle")
                    .datum(root)
                    .attr("r", radius)
                    .attr("fill", "none")
                    .attr("pointer-events", "all")
                    .on("click", clicked);

            });
        }
        return graph;
    }

    componentDidMount() {
        var container = d3.select('#chart');
        container.append('svg').datum({}).call(this.sunburstDiagram());
    }
}

export default App