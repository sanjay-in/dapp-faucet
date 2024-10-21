const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat.config.cjs");
const { verify } = require("../utils/verify.cjs");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = await deployments;
  const { deployer } = await getNamedAccounts();

  const cap = 100000;
  const initialSupply = 70000;
  const blockReward = 100;

  const args = [cap, initialSupply, blockReward];

  log("Deploying Token contract...");

  const token = await deploy("RedToken", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: 1,
  });

  log("Deployed contract");
  log("..............................");

  if (!developmentChains.includes(network.name)) {
    await verify(token.address, args);
  }
};

module.exports.tags = ["all", "token"];
