import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { PRIVATE_KEY, API_KEY, TESTING } = process.env;

if (TESTING) {
  exports = {
    solidity: "0.8.17",
    networks: {
      hardhat: {},
    },
  }
} else {
  exports = {
    solidity: "0.8.17",
    defaultNetwork: "goerli",
    networks: {
      hardhat: {},
      goerli: { 
        url: `https://goerli.infura.io/v3/${API_KEY}`,
        accounts: [`0x${PRIVATE_KEY}`],
      },
    },
  }
}

module.exports = exports;
