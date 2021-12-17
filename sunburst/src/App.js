import React from 'react';
import * as d3 from 'd3';
import { formatData, sequence } from './format'
import { initialize, updateElements } from './SequenceFunnel';
import './index.css'

const width = 732;
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
        this.myRef = React.createRef();
    }

    render() {
        return (
            <React.Fragment>
                <div align="center" style={{ width: '100%' }}>
                    <div id='chart' style={{ width: 800 }} ref={this.myRef}></div>
                </div>
            </React.Fragment>
        );
    }

    sunburstChart = (dataset) => {
        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, dataset.children.length + 1))
        const root = partition(dataset);

        //on click
        const clicked = (event, p) => {
            d3.selectAll('polygon').style("fill", function (d) { return d === sequence[p.y0] || d === sequence[p.y1] ? 'green' : 'gray' });
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

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 1.5)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

        const svg = d3.select(this.myRef.current).append("svg")
            .attr('id', 'sunburst')
            .attr("viewBox", [0, 0, width, width])
            .style("font", "10px sans-serif")
            .append("g") // append g element
            .attr("transform", `translate(${width / 2},${width / 2})`)

        /**********
        * Label*
        **********/
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
            .text(d => d.data.name.substring(0, 14) + (d.data.name.length > 14 ? '...' : ''))
            .style('font-size', 14);

        /**********
         * Tooltip*
         **********/
        var tooltip = d3.select(this.myRef.current)
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .html("<p>I'm a tooltip written in HTML</p><img src='https://github.com/holtzy/D3-graph-gallery/blob/master/img/section/ArcSmal.png?raw=true'></img><br>Fancy<br><span style='font-size: 40px;'>Isn't it?</span>");

        const path = svg.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
                if (d.parent.data.color) {
                    d.data.color = d.parent.data.color;
                }
                return d.data.color ? d.data.color : color(d.data.name);
            })
            .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("d", d => arc(d));

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on('click', clicked)
            .on("mouseover", function (e, d) { 
                return tooltip.style("visibility", "visible"); 
            })
            .on("mousemove", function (e, d) { return tooltip.style("top", (e.pageY + 20) + "px").style("left", (e.pageX + 20) + "px"); })
            .on("mouseout", function (e, d) { return tooltip.style("visibility", "hidden"); });

        const parent = svg.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);
    }

    onSwap = (data) => {
        const dataset = formatData(data)
        d3.select('#sunburst').remove()
        this.sunburstChart(dataset)

    }

    sequenceChart = (sequence) => {
        d3.select(this.myRef.current).append('g').attr("id", "sequence")
        initialize((140 * sequence.length));
        updateElements(sequence, this.onSwap);
    }

    componentDidMount() {
        //sunburst
        const dataset = formatData(sequence)
        this.sequenceChart(sequence)
        this.sunburstChart(dataset)
    }
}

export default App