const { network, getNamedAccounts, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.cjs");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("Faucet", () => {
      let faucetContract, faucet, tokenContract, token, testTokenContract, testToken, deployer, accounts;
      const lockTime = 10;
      const withdrawAmount = 5;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        accounts = await ethers.getSigners();

        await deployments.fixture(["all", "tests"]);

        faucetContract = await deployments.get("Faucet");
        faucet = await ethers.getContractAt(faucetContract.abi, faucetContract.address);

        tokenContract = await deployments.get("RedToken");
        token = await ethers.getContractAt(tokenContract.abi, tokenContract.address);

        testTokenContract = await deployments.get("TestToken");
        testToken = await ethers.getContractAt(testTokenContract.abi, testTokenContract.address);
      });

      describe("constructor", () => {
        it("checks if tokenAddress match", async () => {
          const token = await faucet.token();
          assert.equal(token, tokenContract.address);
        });

        it("checks lockTime is correct", async () => {
          const faucetLockTime = await faucet.s_lockTime();
          const lockTimeInSeconds = lockTime * 60;
          assert.equal(faucetLockTime, lockTimeInSeconds);
        });

        it("checks if withdrawal amount match", async () => {
          const faucetWithdrawalAmount = await faucet.s_withdrawAmount();
          assert.equal(faucetWithdrawalAmount, ethers.parseEther(withdrawAmount.toString()));
        });
      });

      describe("requestToken", () => {
        it("reverts if address is zero", async () => {
          await expect(faucet.requestToken(ethers.ZeroAddress)).to.be.revertedWithCustomError(faucet, "Faucet__InvalidAddress");
        });

        it("reverts if no balance in faucet", async () => {
          await expect(faucet.requestToken(accounts[1])).to.be.revertedWithCustomError(faucet, "Faucet__InsufficientBalanceInFaucet");
        });

        it("reverts if not enough time has passed", async () => {
          await token.transfer(faucetContract.address, ethers.parseEther("100"));

          await faucet.requestToken(accounts[1]);
          await expect(faucet.requestToken(accounts[1])).to.be.revertedWithCustomError(faucet, "Faucet__TimeNotPassedForWithdraw");
        });

        it("checks if token received after request ", async () => {
          await token.transfer(faucetContract.address, ethers.parseEther("100"));

          await faucet.requestToken(accounts[1]);
          const balanceOfAcc1 = await token.balanceOf(accounts[1]);

          assert.equal(balanceOfAcc1, ethers.parseEther(withdrawAmount.toString()));
        });
      });

      describe("withdraw", () => {
        beforeEach(async () => {
          await token.transfer(faucetContract.address, ethers.parseEther("100"));
        });

        it("expects balance of the faucet to be zero after withdraw", async () => {
          const balanceBeforeWithdraw = await token.balanceOf(faucetContract.address);
          assert.equal(balanceBeforeWithdraw, ethers.parseEther("100"));

          await faucet.withdraw();

          const balanceAfterWithdraw = await token.balanceOf(faucetContract.address);
          assert.equal(balanceAfterWithdraw, 0);
        });

        it("expects balance of the deployer to have wothdrawn tokens", async () => {
          const balanceOfDeployerBeforeTransfer = await token.balanceOf(deployer);
          const balanceOfFaucetBeforeWithdraw = await token.balanceOf(faucetContract.address);

          await faucet.withdraw();

          const balanceOfDeployerAfterTransfer = await token.balanceOf(deployer);
          assert.equal(balanceOfDeployerAfterTransfer, balanceOfDeployerBeforeTransfer + balanceOfFaucetBeforeWithdraw);
        });

        it("emits event on withdraw", async () => {
          await expect(faucet.withdraw()).to.emit(faucet, "Withdrawn");
        });
      });

      describe("setLockTime", () => {
        const newLockTime = 20; // 20 minutes

        it("only owner an set locktime", async () => {
          await expect(faucet.connect(accounts[1]).setLockTime(newLockTime)).to.be.revertedWithCustomError(faucet, "Faucet__NotOwner");
        });

        it("checks if new locktime is correct", async () => {
          await faucet.setLockTime(newLockTime);
          const faucetLockTime = await faucet.s_lockTime();
          const newLockTimeInSeconds = newLockTime * 60;
          assert.equal(faucetLockTime, newLockTimeInSeconds);
        });
      });

      describe("setWithdrawAmount", () => {
        const newWithdrawAmount = 10;

        it("only owner an set withdraw amount", async () => {
          await expect(faucet.connect(accounts[1]).setWithdrawAmount(newWithdrawAmount)).to.be.revertedWithCustomError(faucet, "Faucet__NotOwner");
        });

        it("checks if new withdraw amount is correct", async () => {
          await faucet.setWithdrawAmount(newWithdrawAmount);
          const faucetWithdrawAmount = await faucet.s_withdrawAmount();
          assert.equal(faucetWithdrawAmount, ethers.parseEther(newWithdrawAmount.toString()));
        });
      });
    });
