import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { PRIVATE_KEY, API_KEY } = process.env;
module.exports = {
  solidity: "0.8.17",
  // defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    // goerli: { 
    //   url: `https://eth-goerli.alchemyapi.io/v2/${API_KEY}`,
    //   accounts: [`0x${PRIVATE_KEY}`],
    // },
  },
};
