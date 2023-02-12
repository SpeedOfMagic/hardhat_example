import { ethers } from "hardhat";

async function main() {
  const Coin20 = await ethers.getContractFactory("Coin20");
  const coin20 = await Coin20.deploy();
  await coin20.deployed();
  console.log(`Coin20 deployed to ${coin20.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
