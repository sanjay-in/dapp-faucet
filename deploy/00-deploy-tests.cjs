const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat.config.cjs");

module.exports = async ({ getNamedAccounts, deployments }) => {
  if (developmentChains.includes(network.name)) {
    const { deploy, log } = await deployments;
    const { deployer } = await getNamedAccounts();

    const cap = 100000;
    const initialSupply = 70000;
    const blockReward = 10;

    const args = [cap, initialSupply, blockReward];

    log("Deploying TestToken contract...");

    await deploy("TestToken", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmation: 1,
    });

    log("Deployed contract");
    log("..............................");
  }
};

module.exports.tags = ["tests"];
