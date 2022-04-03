const apiKey = `RZZ267K6YESB53V5`;
// const stocks = ["MELI", "BABA"];

const stocks = ["MELI", "BABA", "MSFT", "PYPL", "PLUG", "REGI", "PINS"];

let dateTimeLoaded = new Date();

console.log(dateTimeLoaded);

const day = ("0" + dateTimeLoaded.getDate()).slice(-2);
const month = ("0" + (dateTimeLoaded.getMonth() + 1)).slice(-2);
const year = dateTimeLoaded.getFullYear();
const hour = dateTimeLoaded.getHours();
const min = dateTimeLoaded.getMinutes();

const dttmLoaded = `${year}-${month}-${day} ${hour}:${min}`;
console.log(dttmLoaded);
// import { stocksAlt } from "./stocks";

//initialize stocksData file
const fs = require("fs");
let stocksData = require("./stocksData");
stocksData = [];

//get stocks data functions

var request = require("request");

const getData = function (stockName) {
  request.get(
    {
      url: `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockName}&apikey=${apiKey}`,
      json: true,
      headers: { "User-Agent": "request" },
    },
    (err, res, data) => {
      if (err) {
        console.log("Error:", err);
      } else if (res.statusCode !== 200) {
        console.log("Status:", res.statusCode);
      } else {
        // console.log(data);
        console.log(`>>>>>>>>>>Loading data from API: ${stockName} `);

        const pricesDatesBack = Object.keys(data["Time Series (Daily)"]);

        let pricesDates = [];

        for (let i = 0; i < pricesDatesBack.length; i++) {
          pricesDates.unshift(pricesDatesBack[i]);
        }

        const arrDays = Object.values(
          Object.values(data["Time Series (Daily)"])
        );

        //   console.log(arrDays);
        let prices = [];

        for (let i = 0; i < arrDays.length; i++) {
          prices.unshift(arrDays[i][`4. close`]);
        }
        //console.log(prices, pricesDates);

        let priceDatePairs = [];

        for (let i = 0; i < arrDays.length; i++) {
          let tempObject = {};
          tempObject.price = prices[i];
          tempObject.date = pricesDates[i];
          priceDatePairs.push(tempObject);
        }

        // console.log(priceDatePairs);

        stocksData.push({
          dttmLoaded: dttmLoaded,
          stockName: `${stockName}`,
          priceSeries: priceDatePairs,
        });

        // STEP 3: Writing to a file
        fs.writeFile("stocksData.json", JSON.stringify(stocksData), (err) => {
          // Checking for errors
          if (err) throw err;

          console.log(`Done writing - ${stockName}`); // Success
        });
      }
    }
  );
};

//TODO udelat to nejak rekurzivne

const timeLagNormal = 2000;
const timeLagProlonged = 100000;

setTimeout(function () {
  getData(stocks[0]);
  setTimeout(function () {
    getData(stocks[1]);
    setTimeout(function () {
      getData(stocks[2]);
      setTimeout(function () {
        getData(stocks[3]);
        setTimeout(function () {
          getData(stocks[4]);
          setTimeout(function () {
            getData(stocks[5]);
            setTimeout(function () {
              getData(stocks[6]);
            }, timeLagNormal);
          }, timeLagNormal);
        }, timeLagNormal);
      }, timeLagProlonged);
    }, timeLagNormal);
  }, timeLagNormal);
}, timeLagNormal);
