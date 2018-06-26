const NUM_POINTS = 5000;
let randomless = $("input#myRange.slider").val();
const width = $("#kmeans-demo").width();
const height = width;
let numCentroids = $(".centroids input").val();
let numClusters = $(".clusters input").val();

let centroidBins = [];
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
  $("#order")["0"].innerText = 1;
  showPoints();
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
    .style("stroke-width", "0.5")
    .style("stroke", "black")
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
  let cluster = numClusters;
  let tempX = 0;
  let tempY = 0;

  randomless = (NUM_POINTS * randomless) / 100;
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

//create cendtroid bin to store point
function createCentroidBin() {
  for (let index = 0; index < numCentroids; index++) {
    centroidBins.push([]);
  }
}

// this function assign each point into their group by Euclidean distance
// distance(x1,centroid(cluster2)) < distance(x1,centroid(cluster1)) < distance(x1,centroid(cluster3))
// thus, x1 belong to cluster2, x1 filled same color with centroid2
function coloringPoints() {
  circles = $("#points circle");
  triangles = $("#centroids path");
  
  for (let i = 0; i < circles.length; i++) {
    //get coordinate of point;
    let xCircle = circles[i].getAttribute("cx");
    let yCircle = circles[i].getAttribute("cy");
    let coord = [xCircle, yCircle];

    let xCentroid = triangles[0].__data__[0];
    let yCentroid = triangles[0].__data__[1];
    let tempCentroid = [xCentroid, yCentroid];

    let minDistance = calcDistance(coord, tempCentroid);
    let centroid = triangles[0];

    let indexOfCentroidBin = 0;

    for (let j = 0; j < triangles.length; j++) {
      // xCentroid = triangles[j].getAttribute("transform").slice(9).replace(/\((.+),(.+)\)/,  '$1');
      xCentroid = triangles[j].__data__[0];
      yCentroid = triangles[j].__data__[1];
      coord = [xCircle, yCircle];
      tempCentroid = [xCentroid, yCentroid];

      if (calcDistance(coord, tempCentroid) < minDistance) {
        minDistance = calcDistance(coord, tempCentroid);
        centroid = triangles[j];
        indexOfCentroidBin = j;
      }
    }
    centroidBins[indexOfCentroidBin].push(circles[i]);
    circles[i].setAttribute("fill", centroid.attributes[2].nodeValue);
  }
}

function showPoints() {
  resetPoints();
  createPoints();
}

generateCluster();
showPoints();
createCentroidBin();

function reset() {
  numCentroids = $(".centroids input").val();
  numClusters = $(".clusters input").val();
  randomless = $("input#myRange.slider").val();
  showPoints();
  generateCluster();
  showPoints();
  // coloringPoints();
}

$("#reset").on("click", function() {
  reset();
});

//find the average x value and average y value of all the points
function averageXY(points) {
  let avgX = 0;
  let avgY = 0;

  points.forEach(point => {
    avgX += point.__data__[0];
    avgY += point.__data__[1];
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

//get random color form array colors
function randomColor() {
  return colors[colorIndex < colors.length ? ++colorIndex : (colorIndex = 0)];
}

//calculator for two points
function calcDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
}

//set a counter for "run algorithm" button
$("#run").on("click", function() {
  $("#order")["0"].innerText = +$("#order")["0"].innerText + 1;
  coloringPoints();
  updateCentroids();
  animationForCentroid();
  
});

//update new coordinate of centroid
function updateCentroids() {
  triangles = $("#centroids path");
  
  for (var k in triangles) {
    if (triangles.hasOwnProperty(k)) {
      if (Number.isInteger(+k)) {
        let newCentroid = averageXY(centroidBins[k]);
        centroids[k] = newCentroid;
      }
    }
  }
}


//make centroid move to new position with animation smoother
function animationForCentroid() {
  centroidsGroup.selectAll('path')
                .data(centroids)
                .transition()
                .attr('transform',function(d){ return 'translate(' + d[0] + ',' + d[1] + ')'; });
}