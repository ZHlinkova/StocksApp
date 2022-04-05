"use strict";

const apiKey = `2fd09a0b6974cfbcb454dfa66cd0648e`;

const stockName = `PYPL`;

const getData = function (stockName) {
  d3.json(
    `https://financialmodelingprep.com/api/v3/historical-price-full/${stockName}?apikey=${apiKey}`,
    function (err, data) {
      if (err) {
        return console.log(err);
      } else {
        console.log(data);
      }
    }
  );
};

const codes = ["MELI", "BABA", "MSFT", "PYPL", "PLUG", "REGI", "PINS"];

codes.forEach((code) => {
  getData(code);
});
