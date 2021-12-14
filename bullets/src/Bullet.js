import React from 'react';
import './style.css'
export { default as bullet } from "./bullet/bullet";
const d3 = require('d3')

//rangers - total used
//measures - used, allotted
//markers - total allotted
var data = [
    {},
    { "title": "", "subtitle": "", "ranges": [300], "measures": [10, 50], "markers": [300] },
];

class Bullet extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <React.Fragment>
                <svg id='chart' style={{height:40}}></svg>
            </React.Fragment>
        );
    }



    bulletChart = () => {

        var margin = { top: 5, right: 40, bottom: 20, left: 120 },
            width = 300 - margin.left - margin.right,
            height = 40 - margin.top - margin.bottom;

        function graph(selection) {
            selection.each(function () {

                var chart = d3.bullet()
                    .width(width)
                    .height(height);

                var svg = d3.select("#chart").selectAll("svg")
                    .data(data)
                    .enter().append("svg")
                    .attr("class", "bullet")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(chart);

                var title = svg.append("g")
                    .style("text-anchor", "end")
                    .attr("transform", "translate(-6," + height / 2 + ")");

                title.append("text")
                    .attr("class", "title")
                    .text(function (d) { return d.title; });

                title.append("text")
                    .attr("class", "subtitle")
                    .attr("dy", "1em")
                    .text(function (d) { return d.subtitle; });
            });
        }
        return graph;
    }

    componentDidMount() {
        var container = d3.select('#chart');
        container.append('svg').datum({}).call(this.bulletChart());
    }
}

export default Bullet