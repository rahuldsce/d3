import React from 'react';
import * as d3 from 'd3';
import { sequence } from './format';

const dataset1 = ['Demo', 'Demo1', 'Demo2', 'Demo3', 'Demo4']
const dataset2 = ['Child', 'Child1']

var index = 1
const colors = {
  "Demo": "#5687d1",
  "Demo1": "#7b615c",
  "Demo2": "#de783b",
  "Demo3": "#6ab975",
  "Demo4": "#a173d1",
  "Child": "#aeaeae",
  "Child1": "#aebece",
};

const b = { w: 130, h: 30, s: 3, t: 10 };

const breadcrumbPoints = (d, i) => {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

export const initializeSequence = () => {
  d3.select('#sequence')
    .append('svg')
    .attr("width", 650)
    .attr("height", 50)
    .attr("id", "trail");
}

const button = ()=>{
  d3.select('#sequence').append('Button')
  .text('Update')
  .style('background-color', 'blue')
  .style('color', 'white')
  .style('border', 'none')
  .style('padding', '10px')
  .style('border-radius', '5px')
  .on("click",function(){
    index = index === 1 ? 2 : 1
    updateSequence(index === 1 ? dataset1 : dataset2);
  });
}

export const updateSequence = (data) => {
  var g = d3.select("#trail")
    .selectAll("g")
    .data(data, function (d) { return d; });
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
    .attr("points", breadcrumbPoints)
    .style("fill", function (d) { return colors[d]; });


  entering.append('svg:text')
    .attr("x", (b.w + b.t) / 2)
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text((d) => { return d; })
    .attr('fill', 'white');

  entering.attr("transform", function (d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

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
        initializeSequence();
        button();
        updateSequence(sequence);
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
