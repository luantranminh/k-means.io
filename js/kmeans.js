const NUM_POINTS = 1000;
let randomless = $("input#myRange.slider").val();
const width = $("#kmeans-demo").width();
const height = width;
let numCentroids = $(".centroids input").val();
let points = [];
let centroids = [];
let colors = [
  "blue",
  "maroon",
  "red",
  "orange",
  "yellow",
  "olive",
  "lime",
  "green",
  "aqua",
  "gray",
  "navy",
  "teal",
  "purple"
];
let colorIndex = 0;

//Make an SVG container
var svg = d3
  .select("#kmeans-demo")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//
pointsGroup = svg.append("g").attr("id", "points");
centroidsGroup = svg.append("g").attr("id", "centroids");

$("#myRange").on("input", function(e) {
  randomless = $(e.target).val();
  visualizingPoints();
  coloringPoints();
});

function generateCluster() {
  centroids = [];

  for (let i = 0; i < numCentroids; i++) {
    let centroid = [randomVal(), randomVal()];
    centroids.push(centroid);
  }

  centroidsGroup.selectAll("*").remove();
  centroidsGroup
    .selectAll("triangle")
    .data(centroids)
    .enter()
    .append("path")
    .style("stroke-width", "2")
    .attr("transform", function(d) {
      return "translate(" + d[0] + "," + d[1] + ")";
    })
    .attr(
      "d",
      d3.svg
        .symbol()
        .type("triangle-up")
        .size(150)
    )
    .attr("fill", function() {
      return randomColor();
    });

  console.log(colorIndex);
  console.log(randomColor());
}

//
function createPoints() {
  pointsGroup.selectAll("*").remove();
  pointsGroup
    .selectAll("circle")
    .data(points)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return d[0];
    })
    .attr("cy", function(d) {
      return d[1];
    })
    .attr("r", 3);
}

function resetPoints() {
  points = [];

  let stddev = randomless / 2 + 15;
  let cluster = 4;
  let tempX = 0;
  let tempY = 0;

  randomless = NUM_POINTS * randomless / 100;
  for (let i = 0; i < cluster; i++) {
    tempX = randomVal();
    tempY = randomVal();

    for (let j = 0; j < (NUM_POINTS - randomless) / cluster; j++) {
      // d3.random.normal(num, stddev) return [num - stddev, num + stddev]
      let x = normalVal(d3.random.normal(tempX, stddev));
      let y = normalVal(d3.random.normal(tempY, stddev));
      let point = [x, y];
      points.push(point);
    }
  }

  //return the rest of points outer cluster randomly
  for (let i = 0; i < NUM_POINTS - points.length; i++) {
    let point = [randomVal(), randomVal()];
    points.push(point);
  }
}

function coloringPoints() {
  circles = $("#points circle");
  triangles = $("#centroids path");
  for (let i = 0; i < circles.length; i++) {
    let xCircle = circles[i].getAttribute("cx");
    let yCircle = circles[i].getAttribute("cy");
    let coord = [xCircle, yCircle];

    let xCentroid = triangles[0].getAttribute("transform").slice(9).replace(/\((.+),(.+)\)/,  '$1');
    let yCentroid = triangles[0].getAttribute("transform").slice(9).replace(/\((.+),(.+)\)/,  '$2');

    let tempCentroid = [parseFloat(xCentroid), parseFloat(yCentroid)];
    let minDistance = calcDistance(coord,tempCentroid);
    let centroid = triangles[0];
    for (let j = 0; j < triangles.length; j++) {
      xCentroid = triangles[j].getAttribute("transform").slice(9).replace(/\((.+),(.+)\)/,  '$1');
      yCentroid = triangles[j].getAttribute("transform").slice(9).replace(/\((.+),(.+)\)/,  '$2');
      tempCentroid = [parseFloat(xCentroid), parseFloat(yCentroid)];

      if (calcDistance(coord,tempCentroid) < minDistance) {
        centroid = triangles[j];
      }
    }

    circles[i].setAttribute("fill", centroid.getAttribute("fill"));

  }
}

function visualizingPoints() {
  resetPoints();
  createPoints();
}

generateCluster();
visualizingPoints();
coloringPoints();
function averageXY(points) {
  let avgX = 0;
  let avgY = 0;

  points.forEach(point => {
    avgX += point[0];
    avgY += point[1];
  });

  avgX = avgX / points.length;
  avgY = avgY / points.length;

  return [avgX, avgY];
}

// random value < width - border - radius && val > boder + radius, inter square
function randomVal() {
  return Math.random() * (width - 3) + 3;
}

function normalVal(normalFn) {
  let num = normalFn();
  return num > 3 && num < width - 3 ? num : normalVal(normalFn);
}

function randomColor() {
  return colors[colorIndex >= colors.length ? (colorIndex = 0) : colorIndex++];
}

function calcDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
}
