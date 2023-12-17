var express = require('express');
const axios = require('axios');

var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeGetRequest(url) {
  try {
    const response = await axios.get(url);
    console.log(`Response from ${url}:`, response.data);
  } catch (error) {
    console.error(`Error making GET request to ${url}:`, error.message);
  }
}

async function main() {
  while (true) {
    await makeGetRequest('http://localhost:3000/');
    await delay(5000);
  }
}

main();