"use strict";

//API variables

let stocks = {};

stocks.codes = ["MELI", "BABA", "MSFT", "PYPL", "PLUG", "REGI", "PINS"];

stocks.colors = [
  "#D46A6A",
  "#D49A6A",
  "#407F7F",
  "#55AA55",
  "#801515",
  "#804515",
  "#0D4D4D",
];

console.log(stocks);

let windowWidth;
window.onresize = reportWindowSizeResize;
window.onload = reportWindowSizeLoad;

function reportWindowSizeResize() {
  windowWidth = window.innerWidth;
  console.log("----------Resizing window to:" + windowWidth);

  //clear div before redrawing
  document.getElementById("line-chart").innerHTML = "";
  //drawLineChart
  getData();
}

function reportWindowSizeLoad() {
  windowWidth = window.innerWidth;
  console.log("----------Loading report");
  console.log("Window width: " + windowWidth);
  let dateTimeLoaded = new Date();

  const date = ` ${dateTimeLoaded.getFullYear()}-${
    dateTimeLoaded.getMonth() + 1
  }-${dateTimeLoaded.getDate()} ${dateTimeLoaded.getHours()}:${dateTimeLoaded.getMinutes()}:${dateTimeLoaded.getSeconds()}`;

  //drawLineChart
  getData();
}

//line chart variables
const hL = 200;
const paddingL = 50;
const paddingBottom = 20;
const paddingLeft = 60;
const ticksNox = 5;
const ticksNoY = 5;
const dateFormat = "%d %b";

const getDate = function (d) {
  const strDate = new String(d);

  const year = strDate.substr(0, 4);
  const day = strDate.substr(8); //zero based index
  const month = strDate.substr(5, 2) - 1;

  // console.log(strDate, year, month, day);

  return new Date(year, month, day);
};

const drawLineChart = function (ds, stockName, color) {
  console.log(`>>>>>>>>>>Drawing line chart: ${stockName}`);

  const wL = windowWidth * 0.95 ? windowWidth * 0.95 : 800;

  const minDate = getDate(ds[0].date);
  const maxDate = getDate(ds[ds.length - 1].date);

  //(minDate, maxDate);

  const maxY = d3.max(ds, (d) => Number(d.price));

  //console.log(maxY);

  const scaleLineX = d3.time
    .scale()
    .domain([minDate, maxDate])
    .range([paddingLeft, wL - paddingLeft]);

  const axisX = d3.svg
    .axis()
    .scale(scaleLineX)
    .orient("bottom")
    .ticks(ticksNox)
    .tickFormat(d3.time.format(dateFormat));

  const scaleLineY = d3.scale
    .linear()
    .domain([0, maxY])
    .range([hL - paddingBottom, paddingBottom]);

  const axisY = d3.svg.axis().scale(scaleLineY).ticks(ticksNoY).orient("left");

  const lineFun = d3.svg
    .line()
    .x((d, i) => scaleLineX(getDate(d.date)))
    .y((d) => scaleLineY(d.price))
    .interpolate("linear");

  ///add header
  const header = d3.select(`#line-chart`).append(`h3`).text(`${stockName}`);

  const svg = d3
    .select("#line-chart")
    .append("svg")
    .attr("width", wL)
    .attr("height", hL);

  const axisBottom = svg
    .append("g")
    .call(axisX)
    .attr("class", "axisX")
    .attr("transform", `translate(0,${hL - paddingBottom})`);

  const axisLeft = svg
    .append("g")
    .call(axisY)
    .attr("class", "axisY")
    .attr("transform", `translate(${paddingLeft},0)`);

  const viz = svg
    .append("path")
    .attr("d", lineFun(ds))
    .attr("stroke", `${color}`)
    .attr("stroke-width", 2)
    .attr("fill", "none");

  const dots = svg
    .selectAll("circle")
    .data(ds)
    .enter()
    .append("circle")
    .attr({
      cx: (d, i) => scaleLineX(getDate(d.date)),
      cy: (d) => scaleLineY(d.price),
      r: "2px",
      fill: color,
      class: `circle-${stockName}`,
    });
};

const getData = function () {
  d3.json(
    "https://api.github.com/repos/ZHlinkova/StocksApp/contents/stocksData.json",
    function (err, data) {
      if (err) {
        return console.log(err);
      } else {
        console.log(data);
        const dataDecoded = JSON.parse(window.atob(data.content));
        console.log(dataDecoded);

        for (let i = 0; i < stocks.codes.length; i++) {
          if (i === 0) {
            d3.select("#dttm-loaded")
              .append("h4")
              .text(`Data refreshed ${dataDecoded[i].dttmLoaded}`);
          }
          drawLineChart(
            dataDecoded[i].priceSeries,
            stocks.codes[i],
            stocks.colors[i]
          );
        }
      }
    }
  );
};
