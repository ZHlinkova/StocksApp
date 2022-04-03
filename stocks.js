"use strict";

//API variables

let stocks = [];

const codes = ["MELI", "BABA", "MSFT", "PYPL", "PLUG", "REGI", "PINS"];

const colors = [
  "#D46A6A",
  "#D49A6A",
  "#F25022",
  "#169BD7",
  "#801515",
  "#EED111",
  "#BD081C",
];

d3.select("#all-stocks").attr("value", `${codes.length}`);

for (let i = 0; i < codes.length; i++) {
  let tempObj = {};
  tempObj.code = codes[i];
  tempObj.color = colors[i];
  stocks.push(tempObj);
  d3.select("#stock-option")
    .append("option")
    .text(`${codes[i]}`)
    .attr("value", `${i}`);
}

let windowWidth;
window.onresize = reportWindowSizeResize;
window.onload = reportWindowSizeLoad;

//RESIZE

function reportWindowSizeResize() {
  windowWidth = window.innerWidth;
  console.log("----------Resizing window to:" + windowWidth);

  //clear div before redrawing
  document.getElementById("line-chart").innerHTML = "";
  //drawLineChart
  getData(1);
}

//LOAD
function reportWindowSizeLoad() {
  windowWidth = window.innerWidth;
  console.log("----------Loading report");
  console.log("Window width: " + windowWidth);
  let dateTimeLoaded = new Date();

  const date = ` ${dateTimeLoaded.getFullYear()}-${
    dateTimeLoaded.getMonth() + 1
  }-${dateTimeLoaded.getDate()} ${dateTimeLoaded.getHours()}:${dateTimeLoaded.getMinutes()}:${dateTimeLoaded.getSeconds()}`;

  //drawLineChart
  getData(0);
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

const drawLineChart = function (ds, stockName, color, ticksNo) {
  console.log(`>>>>>>>>>>Drawing line chart: ${stockName}`);

  const wL = windowWidth * 0.95 ? windowWidth * 0.95 : 800;

  const minDate = getDate(ds[0].date);
  const maxDate = getDate(ds[ds.length - 1].date);

  //(minDate, maxDate);

  const maxY = d3.max(ds, (d) => Number(d.price));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const scaleLineX = d3.time
    .scale()
    .domain([minDate, maxDate])
    .range([paddingLeft, wL - paddingLeft]);

  //if Last 7 business days, we want 7 ticks on X
  const tickOnX = ticksNo == 7 ? 7 : ticksNox;

  // console.log(tickOnX);

  const axisX = d3.svg
    .axis()
    .scale(scaleLineX)
    .orient("bottom")
    .ticks(tickOnX)
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

  const xAxisLabel = svg
    .append("text")
    .attr("class", "xAxisLabel")
    .attr("text-anchor", "end")
    .attr("x", paddingLeft - 8)
    .attr("y", paddingBottom - 5)
    // .attr("font-weight", "bold")
    .text("USD");

  const dots = svg
    .selectAll("circle")
    .data(ds)
    .enter()
    .append("circle")
    .attr({
      cx: (d, i) => scaleLineX(getDate(d.date)),
      cy: (d) => scaleLineY(d.price),
      r: "4px",
      fill: color,
      class: `circle-${stockName}`,
    })
    .on("mouseover", function (d) {
      tooltip.transition().duration(500).style("opacity", 0.85);
      tooltip
        .html(
          `<strong>Date: ${d.date}</strong><br><strong>Close price: ${Number(
            d.price
          ).toLocaleString("en-US")} USD<strong>`
        )
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 40 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(300).style("opacity", 0);
    });
};

const getData = function (resize, selectElementsTime, selectStock) {
  d3.json(
    "https://api.github.com/repos/ZHlinkova/StocksApp/contents/stocksData.json",
    function (err, data) {
      if (err) {
        return console.log(err);
      } else {
        // console.log(data);
        const dataDecoded = JSON.parse(window.atob(data.content));
        console.log(dataDecoded);

        d3.select("#max-option")
          .text(`Last ${dataDecoded[0].priceSeries.length} days`)
          .attr("value", `${dataDecoded[0].priceSeries.length}`);

        for (let i = 0; i < stocks.length; i++) {
          if (i === 0 && resize === 0) {
            d3.select("#dttm-loaded")
              .append("h4")
              .text(`Data refreshed ${dataDecoded[i].dttmLoaded}`);
          }

          //if stock not selected, continue

          const selectedStock = selectStock
            ? Number(selectStock)
            : stocks.length;

          console.log(typeof selectedStock, selectedStock);

          if (selectedStock !== i && selectedStock !== stocks.length) {
            continue;
          }

          const selectNo = selectElementsTime ? selectElementsTime : 100;

          const splicedData = dataDecoded[i].priceSeries.splice(
            dataDecoded[i].priceSeries.length - selectNo,
            selectNo
          );
          console.log(splicedData);
          drawLineChart(splicedData, stocks[i].code, stocks[i].color, selectNo);
        }
      }
    }
  );
};

d3.select;

d3.select("#date-option").on("change", (d, i) => {
  const selTime = d3.select("#date-option").node().value;
  // console.log(`Selection: ${selTime}`);
  document.getElementById("line-chart").innerHTML = "";
  getData(1, selTime, d3.select("#stock-option").node().value);
});

d3.select("#stock-option").on("change", (d, i) => {
  const selStock = d3.select("#stock-option").node().value;
  // console.log(`Selection: ${sel}`);
  document.getElementById("line-chart").innerHTML = "";
  getData(1, d3.select("#date-option").node().value, selStock);
});
