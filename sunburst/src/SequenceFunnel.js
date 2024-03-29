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

const width = 230
//width;height;space;vertex
const b = { w: 170, h: 25, s: 1, t: 10 };

const breadcrumbPoints = (d, i) => {
  let j = dataset.length - i
  var w = b.w + i * b.t
  var points = [];
  points.push(0 + j * b.t + ",0");
  points.push(w + b.t + ",0");
  points.push(w + "," + b.h);
  points.push(b.t + j * b.t + "," + b.h);

  return points.join(" ");
}

export const updateElements = (data, onSwap) => {
  var swap = undefined
  var g = d3.select("#trail")
    .selectAll("g")
    .data(data, (d) => { return `${Math.random()}_${d.field}` });
  var entering = g.enter().append("svg:g");

  //add polygon
  entering.append("svg:polygon")
    .attr("points", breadcrumbPoints).style('display', 'inline')
    .style("fill", function (d, i) { return i < 2 ? 'green' : 'gray' })

  //add label
  entering.append('svg:text')
    .attr("x", (b.w + b.t) / 2)
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("dx", "2.2em")
    .style("font-size", "13px")
    .style("font-weight", "700")
    .attr("text-anchor", "middle")
    .text((d) => { return d.label; })
    .attr('fill', 'white');

  entering.attr("transform", function (d, i) {
    let j = data.length - i
    return "translate(0," + (j * (b.h + b.s) + 10) + ")";
  });

  entering.on("mouseover", function () { })
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
    this.sbRef = React.createRef();
  }

  render() {
    return (
      <React.Fragment>
        <div align="center">
        <div id='sequence' ref={this.sbRef} style={{width:200}}></div>
        </div>
      </React.Fragment>
    );
  }

  initialize = () => {
    d3.select(this.sbRef.current)
      .append('svg')
      .attr("id", "trail")
      .attr("viewBox", [0, 0, width, width]);
  }

  sequenceDiagram = () => {
    this.initialize();
    updateElements(dataset);
  }

  componentDidMount() {
    this.sequenceDiagram()
  }
}

export default Sequence;
