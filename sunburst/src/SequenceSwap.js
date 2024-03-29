import React from 'react';
import * as d3 from 'd3';

export const dataset = [
  { label: 'Cloudlet Status', field: 'cloudletStatus' },
  { label: 'Region', field: 'region' },
  { label: 'Operator Name', field: 'operatorName' },
  { label: 'Cloudlet Name', field: 'cloudletName' },
  { label: 'Cluster Name', field: 'clustername' },
  { label: 'App Name', field: 'appname' },
]


//width;height;space;vertex
const b = { w: 130, h: 30, s: 3, t: 10 };

const breadcrumbPoints = (d, i) => {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  // if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
  points.push(b.t + "," + (b.h / 2));
  // }
  return points.join(" ");
}

export const initialize = (width) => {
  d3.select('#sequence')
    .append('svg')
    .attr("width", width ? width : 650)
    .attr("height", 70)
    .attr("id", "trail");
}

export const updateElements = (data, onSwap) => {
  var swap = undefined
  var g = d3.select("#trail")
    .selectAll("g")
    .data(data, (d) => { return `${Math.random()}_${d.field}` });
  var entering = g.enter().append("svg:g");

  //add polygon
  entering.append("svg:polygon")
    .attr("points", breadcrumbPoints)
    .style("fill", function (d, i) { return i < 2 ? 'green' : 'gray' })

  //add label
  entering.append('svg:text')
    .attr("x", (b.w + b.t) / 2)
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text((d) => { return d.label; })
    .attr('fill', 'white');

  entering.attr("transform", function (d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  entering.style("cursor", "pointer").on('click', (e, d) => {
    if (swap === undefined) {
      swap = d
      d3.selectAll('polygon').filter((d1) => { return d1.field !== d.field }).style('opacity', 0.3)
    }
    else {
      var index1 = data.indexOf(swap)
      var index2 = data.indexOf(d)
      data.splice(index1, 1);
      data.splice(index2, 0, swap);
      onSwap && onSwap(data)
      updateElements(data, onSwap)
    }
  })
  g.exit().remove()
}

class Sequence extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <React.Fragment>
        <div id='sequence'></div>
      </React.Fragment>
    );
  }

  sequenceDiagram = () => {
    function graph(selection) {
      selection.each(function (data, i) {
        initialize();
        updateElements(dataset);
      });
    }
    return graph;
  }

  componentDidMount() {
    var container = d3.select('#sequence');
    container.append('svg').datum({}).call(this.sequenceDiagram());
  }
}

export default Sequence;
