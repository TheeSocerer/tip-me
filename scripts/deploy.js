const hre = require("hardhat");

async function main() {
  console.log("Deploying TipJar contract to Base Sepolia...");

  // Get the ContractFactory and Signers
  const TipJar = await hre.ethers.getContractFactory("TipJar");
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const tipJar = await TipJar.deploy();
  await tipJar.deployed();

  console.log("TipJar deployed to:", tipJar.address);
  console.log("Owner:", await tipJar.owner());

  // Verify the contract on Basescan (optional)
  if (hre.network.name === "baseSepolia") {
    console.log("Waiting for block confirmations...");
    await tipJar.deployTransaction.wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: tipJar.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Basescan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: tipJar.address,
    owner: await tipJar.owner(),
    deploymentTimestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });