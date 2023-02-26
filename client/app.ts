const fs = require('fs');

const { API_KEY } = process.env;

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/" + API_KEY));
web3.eth.getBalance("0x9aa1443832DcDc0450935e6ba571C0E81Cd88357").then((result) => {
  console.log(result);
});
