// Import Hardhat runtime environment
const hre = require("hardhat");

// Main deployment function
async function main() {
  console.log("Deploying TipJar contract to Base Sepolia...");

  // Get the contract factory (used to deploy contracts)
  const TipJar = await hre.ethers.getContractFactory("TipJar");
  // Get the first account from the configured accounts
  const [deployer] = await hre.ethers.getSigners();

  // Display deployer information
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract (no constructor arguments needed)
  const tipJar = await TipJar.deploy();
  // Wait for deployment transaction to be mined
  await tipJar.deployed();

  // Display deployment results
  console.log("TipJar deployed to:", tipJar.address);
  console.log("Owner:", await tipJar.owner());

  // Automatically verify contract on Basescan if deploying to testnet
  if (hre.network.name === "baseSepolia") {
    console.log("Waiting for block confirmations...");
    // Wait for 5 block confirmations before verification
    await tipJar.deployTransaction.wait(5);
    
    try {
      // Attempt to verify the contract source code
      await hre.run("verify:verify", {
        address: tipJar.address,
        constructorArguments: [], // No constructor arguments
      });
      console.log("Contract verified on Basescan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Create deployment information object for reference
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: tipJar.address,
    owner: await tipJar.owner(),
    deploymentTimestamp: new Date().toISOString(),
    // Record the block number for reference
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

// Execute the deployment and handle any errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });