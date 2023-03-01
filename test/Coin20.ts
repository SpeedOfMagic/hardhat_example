import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import exp from "constants";

describe("Coin20", function () {
  async function getFixture() {
    const [owner, other] = await ethers.getSigners();

    const Coin20 = await ethers.getContractFactory("Coin20");
    const coin20 = await Coin20.deploy();

    return { owner, other, coin20 };
  }

  describe("Custom structure", function () {
    it("Create profile", async function () {
      const { owner, coin20 } = await getFixture();
      expect(await coin20.createProfile("a", 1, true))
      .to.emit(coin20, "CreateProfile")
      .withArgs(owner.address, "a", 1, true);
    });

    it("Get profile info", async function () {
      const { owner, coin20 } = await getFixture();
      await coin20.createProfile("a", 1, true);

      expect(await coin20.getProfile(owner.address))
      .to.emit(coin20, "GetProfile")
      .withArgs("a", 1, true);
    });

    it("Remove profile", async function () {
      const { owner, coin20 } = await getFixture();
      expect(await coin20.createProfile("a", 1, false))
      .to.emit(coin20, "CreateProfile")
      .withArgs(owner.address, "a", 1, false);
      
      expect(await coin20.getProfile(owner.address))
      .to.emit(coin20, "GetProfile")
      .withArgs("a", 1, false);

      expect(await coin20.removeProfile())
      .to.emit(coin20, "RemoveProfile")
      .withArgs(owner.address);

      expect(await coin20.getProfile(owner.address))
      .to.emit(coin20, "GetProfile")
      .withArgs("", 0, false);
    });

    it("Replace profile", async function () {
      const { owner, coin20 } = await getFixture();
      expect(await coin20.createProfile("a", 1, true))
      .to.emit(coin20, "CreateProfile")
      .withArgs(owner.address, "a", 1, true);

      expect(await coin20.createProfile("b", 2, false))
      .to.emit(coin20, "CreateProfile")
      .withArgs(owner.address, "b", 2, false);
      
      expect(await coin20.getProfile(owner.address))
      .to.emit(coin20, "GetProfile")
      .withArgs("b", 2, false);
    });

    it("Remove empty profile", async function () {
      const { owner, coin20 } = await getFixture();
      expect(await coin20.removeProfile())
      .to.emit(coin20, "RemoveProfile")
      .withArgs(owner.address);

      expect(await coin20.getProfile(owner.address))
      .to.emit(coin20, "GetProfile")
      .withArgs("", 0, false);
    });
  });

  describe("Default values", function () {
    it("Should set correct minter", async function () {
      const { owner, coin20 } = await getFixture();
      expect(await coin20.minter()).to.equal(owner.address);
    });

    it("Should set correct balance", async function () {
      const { owner, other, coin20 } = await getFixture();
      expect(await coin20.balanceOf(owner.address)).to.equal(0);
      expect(await coin20.balanceOf(other.address)).to.equal(0);
    });

    it("Should set correct totalSupply", async function () {
      const { coin20 } = await getFixture();
      expect(await coin20.totalSupply()).to.equal(0);
    });

    it("Should set correct allowance", async function () {
      const { owner, other, coin20 } = await getFixture();
      expect(await coin20.allowance(owner.address, owner.address)).to.equal(0);
      expect(await coin20.allowance(owner.address, other.address)).to.equal(0);
      expect(await coin20.allowance(other.address, owner.address)).to.equal(0);
      expect(await coin20.allowance(other.address, other.address)).to.equal(0);
    });
  });

  it("Mint", async function () {
    const { owner, other, coin20 } = await getFixture();

    await expect(coin20.connect(owner).mint(owner.address, 1)).not.to.be.reverted;
    await expect(coin20.connect(owner).mint(other.address, 2)).not.to.be.reverted;
    await expect(coin20.connect(other).mint(owner.address, 4)).to.be.revertedWith("Only creator can mint coins");
    await expect(coin20.connect(other).mint(other.address, 8)).to.be.revertedWith("Only creator can mint coins");

    expect(await coin20.balanceOf(owner.address)).to.equal(1);
    expect(await coin20.balanceOf(other.address)).to.equal(2);
    expect(await coin20.totalSupply()).to.equal(3);
  });

  describe("ERC20", function () {
    // totalSupply, balanceOf are already checked
    it("Check constants", async function () {
      const { coin20 } = await getFixture();
      expect(await coin20.name()).to.equal("MyToken");
      expect(await coin20.symbol()).to.equal("C20");
      expect(await coin20.decimals()).to.equal(0);
    });

    it("Check transfer", async function () {
      const { owner, other, coin20 } = await getFixture();

      await expect(coin20.transfer(other.address, 1))
        .to.be.revertedWith("Not enough money for transfer");

      await coin20.mint(owner.address, 1);
      await coin20.mint(other.address, 1);

      expect(await coin20.transfer(other.address, 1))
        .to.emit(coin20, "Transfer")
        .withArgs(owner.address, other.address, 1);
      expect(await coin20.balanceOf(owner.address)).to.equal(0);
      expect(await coin20.balanceOf(other.address)).to.equal(2);
      
      expect(await coin20.connect(other).transfer(owner.address, 2))
        .to.emit(coin20, "Transfer")
        .withArgs(other.address, owner.address, 2);
      expect(await coin20.balanceOf(owner.address)).to.equal(2);
      expect(await coin20.balanceOf(other.address)).to.equal(0);
    });

    it("Check approve", async function () {
      const { owner, other, coin20 } = await getFixture();

      expect(await coin20.approve(other.address, 1))
        .to.emit(coin20, "Approve")
        .withArgs(owner.address, other.address, 1);
        
      expect(await coin20.connect(other).approve(owner.address, 2))
        .to.emit(coin20, "Approve")
        .withArgs(other.address, owner.address, 2);
    });

    it("Check allowance", async function () {
      const { owner, other, coin20 } = await getFixture();

      await coin20.approve(other.address, 1);
      expect(await coin20.allowance(owner.address, other.address)).to.equal(1);

      await coin20.connect(other).approve(owner.address, 2)
      expect(await coin20.allowance(other.address, owner.address)).to.equal(2);
  
      await coin20.approve(other.address, 0);
      expect(await coin20.allowance(owner.address, other.address)).to.equal(0);
    });

    it("Check transferFrom", async function () {
      const { owner, other, coin20 } = await getFixture();
      await expect(coin20.transferFrom(owner.address, other.address, 1))
        .to.be.revertedWith("Not enough money for transfer");
      await coin20.mint(owner.address, 1);
      await coin20.mint(other.address, 1);

      await expect(coin20.transferFrom(owner.address, other.address, 1))
        .to.be.revertedWith("Not enough allowance for transfer");
      await coin20.approve(other.address, 1);
      await coin20.connect(other).approve(owner.address, 2);

      expect(await coin20.connect(other).transferFrom(owner.address, other.address, 1))
        .to.emit(coin20, "Transfer")
        .withArgs(owner.address, other.address, 1);
      expect(await coin20.balanceOf(owner.address)).to.equal(0);
      expect(await coin20.balanceOf(other.address)).to.equal(2);
      
      expect(await coin20.transferFrom(other.address, owner.address, 2))
        .to.emit(coin20, "Transfer")
        .withArgs(other.address, owner.address, 2);
      expect(await coin20.balanceOf(owner.address)).to.equal(2);
      expect(await coin20.balanceOf(other.address)).to.equal(0);
    });
  });
})
