const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken, token, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    MyToken = await ethers.getContractFactory("MyToken");
    const name = "SparkTech Token";
    const symbol = "SPRK";
    const decimals = 18;
    const initialSupply = ethers.parseUnits("1000000", decimals);

    token = await MyToken.deploy(name, symbol, initialSupply);
    await token.waitForDeployment();
  });

  it("should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("SparkTech Token");
    expect(await token.symbol()).to.equal("SPRK");
  });

  it("should assign the initial supply to the owner", async function () {
    const balance = await token.balanceOf(owner.address);
    const totalSupply = await token.totalSupply();
    expect(balance).to.equal(totalSupply);
  });

  it("should transfer tokens between accounts", async function () {
    const amount = ethers.parseUnits("100", 18);
    await token.transfer(addr1.address, amount);
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
  });

  it("should handle approve and transferFrom", async function () {
    const amount = ethers.parseUnits("50", 18);
    await token.transfer(addr1.address, amount);

    await token.connect(addr1).approve(addr2.address, amount);
    await token.connect(addr2).transferFrom(addr1.address, addr2.address, amount);

    expect(await token.balanceOf(addr1.address)).to.equal(0n);
    expect(await token.balanceOf(addr2.address)).to.equal(amount);
  });

  it("should allow owner to mint tokens", async function () {
    const mintAmount = ethers.parseUnits("5000", 18);
    const initialTotalSupply = await token.totalSupply();

    await token.mint(addr1.address, mintAmount);

    expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
    expect(await token.totalSupply()).to.equal(initialTotalSupply + mintAmount);
  });

  it("should not allow non-owner to mint tokens", async function () {
    const mintAmount = ethers.parseUnits("1000", 18);
    await expect(
      token.connect(addr1).mint(addr1.address, mintAmount)
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("should allow token holder to burn their tokens", async function () {
    const burnAmount = ethers.parseUnits("100", 18);
    const initialTotalSupply = await token.totalSupply();

    await token.transfer(addr1.address, burnAmount);
    await token.connect(addr1).burn(burnAmount);

    expect(await token.balanceOf(addr1.address)).to.equal(0n);
    expect(await token.totalSupply()).to.equal(initialTotalSupply - burnAmount);
  });
});
