const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat.config.cjs");
const { default: verify } = require("../utils/verify.cjs");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = await deployments;
  const { deployer } = await getNamedAccounts();

  const contract = await deployments.get("RedToken");
  const token = await ethers.getContractAt(contract.abi, contract.address);

  const tokenAddress = contract.address;
  const lockTime = 10;
  const withdrawAmount = 5;

  const args = [tokenAddress, lockTime, withdrawAmount];

  log("Deploying Faucet contract...");

  const faucet = await deploy("Faucet", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: network.blockConfirmations,
  });

  log("Deployed contract");
  log("..............................");

  if (!developmentChains.includes(network.name)) {
    await verify(faucet.address, args);
  }
};

module.exports.tags = ["all", "faucet"];
