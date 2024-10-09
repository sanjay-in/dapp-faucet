const { network, deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.cjs");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip()
  : describe("Token", () => {
      let deployer, accounts, contract, token, testContract, testToken;
      const name = "RedToken";
      const symbol = "RDT";
      const capValue = 100000;
      const blockReward = 10;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        accounts = await ethers.getSigners();

        await deployments.fixture(["all", "tests"]);

        contract = await deployments.get("RedToken");
        token = await ethers.getContractAt(contract.abi, contract.address);

        testContract = await deployments.get("TestToken");
        testToken = await ethers.getContractAt(testContract.abi, testContract.address);
      });

      describe("constructor", () => {
        it("checks if cap value is correct", async () => {
          const cap = await token.cap();
          assert.equal(cap, ethers.parseEther(capValue.toString()));
        });

        it("checks if totalSupply is correctly assigned to deployer", async () => {
          const balanceOfDeployer = await token.balanceOf(deployer);
          const totalSupply = await token.totalSupply();
          assert.equal(balanceOfDeployer, totalSupply);
        });

        it("checks if blockReward is set correctly", async () => {
          const tokenBlockReward = await token.s_blockReward();
          assert.equal(tokenBlockReward, ethers.parseEther(blockReward.toString()));
        });

        it("checks owner", async () => {
          const ownerOfContract = await token.i_owner();
          assert.equal(ownerOfContract, deployer);
        });

        it("checks if token name is correct", async () => {
          const tokenName = await token.name();
          assert.equal(tokenName, name);
        });

        it("checks if token symbol is correct", async () => {
          const tokenSymbol = await token.symbol();
          assert.equal(tokenSymbol, symbol);
        });
      });

      describe("mint function", () => {
        it("reverts if mint value is greater than cap value", async () => {
          const tokensToMint = ethers.parseEther((capValue + 1).toString());
          await expect(testToken.testMint(deployer, tokensToMint)).to.be.revertedWithCustomError(token, "RedToken__MaxCapExceeded");
        });

        it("checks mint", async () => {
          const totalSupplyBeforeMint = await testToken.totalSupply();
          const tokensToMint = ethers.parseEther("1000");
          await testToken.testMint(accounts[1], tokensToMint);
          const totalSupplyAfterMint = await testToken.totalSupply();
          assert.equal(totalSupplyAfterMint, totalSupplyBeforeMint + tokensToMint);
        });
      });

      describe("mint miner rewards", () => {
        it("checks if miner gets reward", async () => {
          const totalSupplyBeforeMint = await testToken.totalSupply();
          await testToken.testMintMinerReward();
          const totalSupplyAfterMint = await testToken.totalSupply();
          assert.equal(totalSupplyAfterMint, totalSupplyBeforeMint + ethers.parseEther(blockReward.toString()));
        });
      });

      describe("transfer", () => {
        it("transfers to account", async () => {
          const tokenToTranfer = 100;
          const balanceBeforeTransfer = await testToken.balanceOf(accounts[1]);
          await testToken.testTransfer(deployer, accounts[1], tokenToTranfer);
          const balanceAfterTransfer = await testToken.balanceOf(accounts[1]);
          assert.equal(balanceAfterTransfer.toString(), (Number(balanceBeforeTransfer) + tokenToTranfer).toString());
        });
      });

      describe("set block rewards", () => {
        it("checks is block reward is set correct", async () => {
          const newBlockReward = 10;
          await token.setBlockReward(newBlockReward);
          const latestBlockReward = await token.s_blockReward();
          assert.equal(latestBlockReward, ethers.parseEther(newBlockReward.toString()));
        });

        it("reverts if block reward is called not by not owner of contract", async () => {
          const newBlockReward = 10;
          await expect(token.connect(accounts[1]).setBlockReward(newBlockReward)).to.be.revertedWithCustomError(token, "RedToken__NotOwner");
        });
      });
    });
