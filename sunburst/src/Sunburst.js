import React from 'react';
import * as d3 from 'd3';
import { formatData, sequence } from './format'
// import { initialize, updateElements } from './SequenceFunnel';
import './index.css'

const width = 732;
const radius = width / 6

const arcVisible = (d) => {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}

const labelVisible = (d) => {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

const iconVisible = (d) => {
    return d.y1 === 3 && d.y0 === 2 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
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

class Sunburst extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
        this.sbRef = React.createRef();
    }

    render() {
        return (
            <div id='chart' style={{ padding: 10, borderRadius: 5 }} ref={this.sbRef}></div>
        );
    }

    sunburstChart = (dataset) => {
        const format = d3.format(",d")
        const color = d3.scaleOrdinal(d3.schemePastel1)
        const root = partition(dataset);

        //on click
        const clicked = (event, p) => {
            d3.selectAll('polygon').style("fill", function (d) { return d === sequence[p.y0] || d === sequence[p.y1] ? 'green' : 'gray' });
            parent.datum(p.parent || root);

            logo.style("visibility", p.depth === 0 ? "visible" : "hidden");
            

            root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

            parentLabel.text(p.data.name).style('fill', 'white')

            this.setState({ tooltipData: p.data })

            const t = svg.transition().duration(750);

            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function (d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.9 : 0.4) : 0)
                .attrTween("d", d => () => arc(d.current));

            label.filter(function (d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));


            icon.transition(t)
                .attr("fill-opacity", d => {
                    return +(iconVisible(d.target) && Boolean(d.data.errorexist))
                })
                .attrTween("transform", d => () => labelTransform(d.current));
        }

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 1.5)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

        const svg = d3.select(this.sbRef.current).append("svg")
            .attr('id', 'sunburst')
            .attr("viewBox", [0, 0, width, width])
            .style("font", "10px sans-serif")
            .append("g") // append g element
            .attr("transform", `translate(${width / 2},${width / 2})`)

        /**********
         * Tooltip*
         **********/
        var tooltip = d3.select(this.sbRef.current)
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        const path = svg.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
                let data = d.data
                let value = color(data.name)
                if (data.color) {
                    value = data.color;
                }
                return value;
            })
            .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 0.8 : 0.4) : 0)
            .attr("d", d => arc(d));

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on('click', clicked);

        path.on("mouseover", (e, d) => {
            if (d.children || d.data.error) {
                tooltip.html(() => {
                    return `<div style="font-size:10px;" align="left">
                    <p>${'Name: ' + d.data.name}</p>
                    <p>${d.children ? 'Count: ' + format(d.children.length) : ''}</p>
                    <p>${d.data.error ? 'Error: ' + d.data.error : ''}</p>
                    </div>`
                });
                tooltip.style("visibility", "visible");
            }
        })
            .on("mousemove", function (e, d) { return tooltip.style("top", (e.pageY + 20) + "px").style("left", (e.pageX + 20) + "px"); })
            .on("mouseout", function (e, d) { return tooltip.style("visibility", "hidden"); });

        /**********
       * Label*
       **********/

        const labelData = svg.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))

        const label = labelData
            .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d))
            .attr("transform", d => labelTransform(d))
            .text(d => d.data.name.substring(0, 14) + (d.data.name.length > 14 ? '...' : ''))
            .style('font-size', 14)
            .style('fill', 'white')

        const icon = labelData
            .join("text")
            .attr("dy", "-0.5em")
            .attr("dx", "-1.9em")
            .attr("fill-opacity", d => +(iconVisible(d) && Boolean(d.data.errorexist)))
            .attr("transform", d => labelTransform(d))
            .style('font-family', 'Linearicons-Free')
            .attr('font-size', '20px')
            .text('\ue880')
            .attr('x', 40)
            .attr('y', 40)
            .attr("fill", "red");


        const parent = svg.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked)

        const parentLabel = svg.append("text")
            .attr("class", "total")
            .attr("text-anchor", "middle")
            .attr('font-size', '3em')
            .attr('y', 12)
            .attr('x', 1)

          const logo =   svg.append("svg:image")
            .attr('x', -50)
            .attr('y', -21)
            .attr('width', 100)
            .attr("xlink:href", "assets/logo_small_x.png")
    }

    onSwap = (data) => {
        const dataset = formatData(data)
        d3.select('#sunburst').remove()
        this.sunburstChart(dataset)

    }

    sequenceChart = (sequence) => {
        // d3.select(this.sbRef.current).append('g').attr("id", "sequence")
        // initialize((140 * sequence.length));
        // updateElements(sequence, this.onSwap);
    }

    componentDidMount() {
        //sunburst
        const dataset = formatData(sequence)
        // this.sequenceChart(sequence)
        this.sunburstChart(dataset)
    }
}

export default Sunburst