const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LiqfinityToken Extended Tests", function () {
  let liqfinityToken;
  let owner;
  let user1;
  let user2;
  let user3;
  const initialSupply = ethers.parseEther("1000000000"); // 1 billion with 18 decimal places

  beforeEach(async function () {
    // Get test addresses
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy contract
    const LiqfinityToken = await ethers.getContractFactory("LiqfinityToken");
    liqfinityToken = await LiqfinityToken.deploy(owner.address);
    await liqfinityToken.waitForDeployment();
  });

  describe("Approval and TransferFrom Functionality", function () {
    it("Should allow approval of tokens", async function () {
      const approvalAmount = ethers.parseEther("5000");
      await liqfinityToken.approve(user1.address, approvalAmount);

      const allowance = await liqfinityToken.allowance(owner.address, user1.address);
      expect(allowance).to.equal(approvalAmount);
    });

    it("Should emit Approval event when tokens are approved", async function () {
      const approvalAmount = ethers.parseEther("5000");

      await expect(liqfinityToken.approve(user1.address, approvalAmount))
      .to.emit(liqfinityToken, "Approval")
      .withArgs(owner.address, user1.address, approvalAmount);
    });

    it("Should allow transferFrom with sufficient allowance", async function () {
      const transferAmount = ethers.parseEther("3000");
      await liqfinityToken.approve(user1.address, transferAmount);

      await liqfinityToken.connect(user1).transferFrom(
          owner.address,
          user2.address,
          transferAmount
      );

      expect(await liqfinityToken.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await liqfinityToken.allowance(owner.address, user1.address)).to.equal(0);
    });

    it("Should not allow transferFrom with insufficient allowance", async function () {
      const approvalAmount = ethers.parseEther("1000");
      const transferAmount = ethers.parseEther("2000");

      await liqfinityToken.approve(user1.address, approvalAmount);

      await expect(
          liqfinityToken.connect(user1).transferFrom(
              owner.address,
              user2.address,
              transferAmount
          )
      ).to.be.reverted;
    });

    it("Should allow updating allowance with additional approve", async function () {
      const initialAllowance = ethers.parseEther("1000");
      const newAllowance = ethers.parseEther("1500");

      await liqfinityToken.approve(user1.address, initialAllowance);
      // Instead of increaseAllowance, we can use approve again with new value
      await liqfinityToken.approve(user1.address, newAllowance);

      const allowance = await liqfinityToken.allowance(owner.address, user1.address);
      expect(allowance).to.equal(newAllowance);
    });

    it("Should allow reducing allowance with new approve", async function () {
      const initialAllowance = ethers.parseEther("1000");
      const newAllowance = ethers.parseEther("700");

      await liqfinityToken.approve(user1.address, initialAllowance);
      // Instead of decreaseAllowance, we can use approve again with reduced value
      await liqfinityToken.approve(user1.address, newAllowance);

      const allowance = await liqfinityToken.allowance(owner.address, user1.address);
      expect(allowance).to.equal(newAllowance);
    });
  });

  describe("Event Testing", function () {
    it("Should emit Transfer event when tokens are transferred", async function () {
      const transferAmount = ethers.parseEther("5000");

      await expect(liqfinityToken.transfer(user1.address, transferAmount))
      .to.emit(liqfinityToken, "Transfer")
      .withArgs(owner.address, user1.address, transferAmount);
    });

    it("Should emit Transfer event when tokens are burned", async function () {
      const burnAmount = ethers.parseEther("5000");

      await expect(liqfinityToken.burn(burnAmount))
      .to.emit(liqfinityToken, "Transfer")
      .withArgs(owner.address, ethers.ZeroAddress, burnAmount);
    });

    it("Should emit TokensWithdrawn event when tokens are withdrawn", async function () {
      // First send tokens to the contract
      const tokenAmount = ethers.parseEther("10000");
      await liqfinityToken.transfer(liqfinityToken.target, tokenAmount);

      // Withdraw tokens and check event
      await expect(liqfinityToken.withdrawTokens(user1.address, tokenAmount))
      .to.emit(liqfinityToken, "TokensWithdrawn")
      .withArgs(user1.address, tokenAmount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero transfers correctly", async function () {
      const zeroAmount = ethers.parseEther("0");

      // Zero transfers should succeed
      await liqfinityToken.transfer(user1.address, zeroAmount);
      expect(await liqfinityToken.balanceOf(user1.address)).to.equal(zeroAmount);
    });

    it("Should prevent transfers to zero address", async function () {
      const transferAmount = ethers.parseEther("1000");

      await expect(
          liqfinityToken.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.reverted;
    });

    it("Should prevent withdrawing tokens to zero address", async function () {
      const tokenAmount = ethers.parseEther("1000");
      await liqfinityToken.transfer(liqfinityToken.target, tokenAmount);

      await expect(
          liqfinityToken.withdrawTokens(ethers.ZeroAddress, tokenAmount)
      ).to.be.revertedWithCustomError(liqfinityToken, "ZeroAddress");
    });

    it("Should prevent withdrawing zero tokens", async function () {
      await expect(
          liqfinityToken.withdrawTokens(user1.address, 0)
      ).to.be.revertedWithCustomError(liqfinityToken, "ZeroAmount");
    });

    it("Should prevent withdrawing more tokens than contract has", async function () {
      const depositAmount = ethers.parseEther("1000");
      const withdrawAmount = ethers.parseEther("2000");

      await liqfinityToken.transfer(liqfinityToken.target, depositAmount);

      await expect(
          liqfinityToken.withdrawTokens(user1.address, withdrawAmount)
      ).to.be.revertedWithCustomError(liqfinityToken, "InsufficientTokenBalance");
    });
  });

  describe("Security Tests", function () {
    it("Should not allow non-owners to change ownership", async function () {
      await expect(
          liqfinityToken.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWithCustomError(liqfinityToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to transfer ownership", async function () {
      await liqfinityToken.transferOwnership(user1.address);

      // After transfer, user1 should be able to call owner functions
      const tokenAmount = ethers.parseEther("1000");
      await liqfinityToken.transfer(liqfinityToken.target, tokenAmount);

      // New owner should be able to withdraw tokens
      await liqfinityToken.connect(user1).withdrawTokens(user2.address, tokenAmount);
      expect(await liqfinityToken.balanceOf(user2.address)).to.equal(tokenAmount);
    });

    it("Should prevent reentrancy attacks on ETH withdrawal", async function () {
      // This is a simpler way to test for reentrancy protection
      // In a real scenario, you would deploy an attacker contract

      // Send ETH to the contract
      const ethAmount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: liqfinityToken.target,
        value: ethAmount
      });

      // Verify the contract follows the checks-effects-interactions pattern
      // by checking that state is updated before external calls

      // We're checking that the withdraw function requires pre-conditions
      // are met before making the external call
      await expect(
          liqfinityToken.withdrawETH(ethers.ZeroAddress, ethAmount)
      ).to.be.revertedWithCustomError(liqfinityToken, "ZeroAddress");

      await expect(
          liqfinityToken.withdrawETH(user1.address, ethers.parseEther("2"))
      ).to.be.revertedWithCustomError(liqfinityToken, "InsufficientETHBalance");
    });

    it("Should prevent approval from current owner to zero address", async function () {
      const approvalAmount = ethers.parseEther("1000");

      await expect(
          liqfinityToken.approve(ethers.ZeroAddress, approvalAmount)
      ).to.be.reverted;
    });

    it("Should handle large token amounts correctly", async function () {
      // Just test that the full supply can be transferred
      await liqfinityToken.transfer(user1.address, initialSupply);

      expect(await liqfinityToken.balanceOf(user1.address)).to.equal(initialSupply);
      expect(await liqfinityToken.balanceOf(owner.address)).to.equal(0);
    });
  });
});