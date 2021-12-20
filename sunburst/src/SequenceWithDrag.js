import React from 'react';
import * as d3 from 'd3';

const dataset1 = ['Region', 'Status', 'Operator', 'Cloudlet', 'Demo4']
const dataset2 = ['Child', 'Child1']
var dragging = {};
var swap1
var index = 1
const colors = {
  "Region": "#5687d1",
  "Status": "#7b615c",
  "Operator": "#de783b",
  "Cloudlet": "#6ab975",
  "Demo4": "#a173d1",
  "Child": "#aeaeae",
  "Child1": "#aebece",
};

function onStart(e, d) {
  d3.select(this).raise().classed("active", true);
}

function onDrag(e, d) {

  d3.selectAll('polygon')
}

function onEnd(e, d) {
}

const b = { w: 100, h: 30, s: 13, t: 10 };

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

export const initializeSequence = () => {
  d3.select('#sequence')
    .append('svg')
    .attr("width", 650)
    .attr("height", 50)
    .attr("id", "trail");
}

const button = () => {
  d3.select('#sequence').append('Button')
    .text('Update')
    .style('background-color', 'blue')
    .style('color', 'white')
    .style('border', 'none')
    .style('padding', '10px')
    .style('border-radius', '5px')
    .on("click", function () {
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


  entering.style("cursor", "pointer").on('click', (e, d) => {
    if (swap1 === undefined) {
      swap1 = d
      d3.selectAll('polygon').filter((d1)=>{return d1===d}).style('fill', 'black')
    }
    else {
      var temp = dragging[d]
      dragging[d] = dragging[swap1]
      dragging[swap1] = temp
      swap1 = undefined
      entering.attr("transform", function (d, i) {
        return "translate(" + dragging[d].x + ", 0)";
      });
      d3.selectAll('polygon').style("fill", function (d) { return colors[d]; });
    }
  })
  entering.append('svg:text')
    .attr("x", (b.w + b.t) / 2)
    .attr("y", b.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text((d) => { return d; })
    .attr('fill', 'white');

  entering.attr("transform", function (d, i) {
    dragging[d] = { x: i * (b.w + b.s), i }
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });
  entering.call(d3.drag().on('start', (e, d) => {

  }).on('drag', (e, d) => {
    entering.filter((d1) => { return d1 == d }).raise().attr("transform", "translate(" + e.x + "," + 0 + ")");
  }).on('end', (e, d) => {

    let keys = Object.keys(dragging)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      var pre = i - 1 >= 0 ? dragging[dataset1[i - 1]].x : undefined
      var next = i === keys.length ? undefined : dragging[key].x
      if ((pre === undefined || e.x > pre) && (next === undefined || e.x < next)) {
        var temp = dragging[d].x
        dragging[d].x = dragging[key].x
        dragging[key].x = temp
        break;
      }
    }
    entering.attr("transform", function (d, i) {
      return "translate(" + dragging[d].x + ", 0)";
    });

  }))

  g.exit().remove()

}

var orders = {
  name: d3.range(dataset1.length).sort(function (a, b) { return d3.ascending(dataset1[a], dataset1[b]); })
};

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
        updateSequence(dataset1, true);
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
