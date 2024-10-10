const hre = require("hardhat");

async function main() {
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const tokenContract = await hre.deployments.get("RedToken");
  const token = await hre.ethers.getContractAt(tokenContract.abi, tokenContract.address);

  const balance = await token.balanceOf(contractAddress);

  console.log(`Balance of contract ${contractAddress}: ${hre.ethers.formatEther(balance)} RDT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
