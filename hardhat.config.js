// Import required Hardhat plugins and utilities
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables from .env file
require("dotenv").config();

// Hardhat configuration object
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Solidity compiler configuration
  solidity: {
    version: "0.8.19",
    settings: {
      // Enable optimizer to reduce gas costs
      optimizer: {
        enabled: true,
        runs: 200 // Optimize for 200 function calls
      }
    }
  },
  // Network configurations for deployment
  networks: {
    // Base Sepolia testnet configuration
    baseSepolia: {
      // RPC URL for Base Sepolia (from environment or default)
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      // Private key for deployment account (from environment)
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532, // Base Sepolia chain ID
    },
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  // Configuration for contract verification on block explorers
  etherscan: {
    apiKey: {
      // API key for Basescan (Base's block explorer)
      baseSepolia: process.env.BASESCAN_API_KEY || ""
    },
    // Custom chain configuration for Base Sepolia
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};