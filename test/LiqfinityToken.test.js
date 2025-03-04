// Tests for Liqfinity Token (LFAI)
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LiqfinityToken", function () {
  let liqfinityToken;
  let owner;
  let user1;
  let user2;
  const initialSupply = ethers.parseEther("1000000000"); // 1 billion with 18 decimal places

  beforeEach(async function () {
    // Get test addresses
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const LiqfinityToken = await ethers.getContractFactory("LiqfinityToken");
    liqfinityToken = await LiqfinityToken.deploy(owner.address);
    await liqfinityToken.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await liqfinityToken.name()).to.equal("Liqfinity AI");
      expect(await liqfinityToken.symbol()).to.equal("LFAI");
    });

    it("Should allocate the entire initial supply to the owner", async function () {
      const ownerBalance = await liqfinityToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialSupply);
    });

    it("Should set the correct owner", async function () {
      expect(await liqfinityToken.owner()).to.equal(owner.address);
    });
  });

  describe("Token Transfers", function () {
    it("Should allow the owner to transfer tokens", async function () {
      const transferAmount = ethers.parseEther("1000");
      await liqfinityToken.transfer(user1.address, transferAmount);

      const user1Balance = await liqfinityToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(transferAmount);

      const ownerBalance = await liqfinityToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialSupply - transferAmount);
    });

    it("Should allow users to transfer received tokens", async function () {
      const transferAmount = ethers.parseEther("1000");
      await liqfinityToken.transfer(user1.address, transferAmount);

      const transferToUser2 = ethers.parseEther("400");
      await liqfinityToken.connect(user1).transfer(user2.address, transferToUser2);

      expect(await liqfinityToken.balanceOf(user2.address)).to.equal(transferToUser2);
      expect(await liqfinityToken.balanceOf(user1.address)).to.equal(transferAmount - transferToUser2);
    });

    it("Should not allow transferring more tokens than a user owns", async function () {
      const transferAmount = ethers.parseEther("1000");
      await liqfinityToken.transfer(user1.address, transferAmount);

      const excessiveAmount = ethers.parseEther("2000");
      await expect(
          liqfinityToken.connect(user1).transfer(user2.address, excessiveAmount)
      ).to.be.reverted;
    });
  });

  describe("Owner Functions", function () {
    it("Should allow the owner to withdraw tokens from the contract", async function () {
      // First send tokens to the contract
      const tokenAmount = ethers.parseEther("10000");
      await liqfinityToken.transfer(liqfinityToken.target, tokenAmount);

      // Check if the contract received the tokens
      expect(await liqfinityToken.balanceOf(liqfinityToken.target)).to.equal(tokenAmount);

      // Withdraw tokens to user1
      await liqfinityToken.withdrawTokens(user1.address, tokenAmount);

      // Check if user1 received the tokens
      expect(await liqfinityToken.balanceOf(user1.address)).to.equal(tokenAmount);
      expect(await liqfinityToken.balanceOf(liqfinityToken.target)).to.equal(0);
    });

    it("Should not allow regular users to withdraw tokens", async function () {
      // Send tokens to the contract
      const tokenAmount = ethers.parseEther("10000");
      await liqfinityToken.transfer(liqfinityToken.target, tokenAmount);

      // Attempt to withdraw tokens by a regular user
      await expect(
          liqfinityToken.connect(user1).withdrawTokens(user1.address, tokenAmount)
      ).to.be.revertedWithCustomError(liqfinityToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow the owner to withdraw ETH from the contract", async function () {
      // Send ETH to the contract
      const ethAmount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: liqfinityToken.target,
        value: ethAmount
      });

      // Check contract balance
      expect(await ethers.provider.getBalance(liqfinityToken.target)).to.equal(ethAmount);

      // Remember user1's initial balance
      const initialUser1Balance = await ethers.provider.getBalance(user1.address);

      // Withdraw ETH to user1
      await liqfinityToken.withdrawETH(user1.address, ethAmount);

      // Check user1's and contract's balance
      const finalUser1Balance = await ethers.provider.getBalance(user1.address);
      expect(finalUser1Balance - initialUser1Balance).to.equal(ethAmount);
      expect(await ethers.provider.getBalance(liqfinityToken.target)).to.equal(0);
    });

    it("Should not allow regular users to withdraw ETH", async function () {
      // Send ETH to the contract
      const ethAmount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: liqfinityToken.target,
        value: ethAmount
      });

      // Attempt to withdraw ETH by a regular user
      await expect(
          liqfinityToken.connect(user1).withdrawETH(user1.address, ethAmount)
      ).to.be.revertedWithCustomError(liqfinityToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Burning Function", function () {
    it("Should allow users to burn their tokens", async function () {
      const transferAmount = ethers.parseEther("1000");
      await liqfinityToken.transfer(user1.address, transferAmount);

      const burnAmount = ethers.parseEther("400");
      await liqfinityToken.connect(user1).burn(burnAmount);

      expect(await liqfinityToken.balanceOf(user1.address)).to.equal(transferAmount - burnAmount);
      expect(await liqfinityToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });

  describe("Receiving ETH", function () {
    it("Should receive ETH and emit an event", async function () {
      const ethAmount = ethers.parseEther("1");

      await expect(
          owner.sendTransaction({
            to: liqfinityToken.target,
            value: ethAmount
          })
      ).to.emit(liqfinityToken, "ETHReceived")
      .withArgs(owner.address, ethAmount);

      expect(await ethers.provider.getBalance(liqfinityToken.target)).to.equal(ethAmount);
    });
  });
});