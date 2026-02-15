const { ethers } = require("hardhat");

async function main() {
  const name = "SparkTech Token";
  const symbol = "SPRK";
  const decimals = 18;
  const initialSupply = ethers.parseUnits("1000000", decimals); // 1,000,000 SPRK

  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(name, symbol, initialSupply);

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("MyToken deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
