# 🪙 Onchain Tip Jar

A Web3 tutorial application that allows users to send tips with messages on the Base Sepolia testnet. Perfect for learning Web3 development fundamentals including smart contracts, wallet integration, and blockchain interactions.

## 🛠️ Tech Stack

- **Smart Contract**: Solidity ^0.8.19
- **Development Framework**: Hardhat
- **Frontend**: Vanilla HTML, CSS, JavaScript with Ethers.js
- **Blockchain Network**: Base Sepolia Testnet
- **Wallet Support**: MetaMask, Coinbase Wallet

## ✨ Features

### Core Features
- 🔗 **Wallet Connection**: Connect MetaMask or Coinbase Wallet
- 💰 **Send Tips**: Send ETH tips with custom messages
- 📝 **Message Logging**: All tips include sender messages
- 👑 **Owner Withdrawals**: Contract owner can withdraw all tips
- 📊 **Real-time Balance**: View current contract balance and tip count
- 📜 **Tip History**: Display recent tips with sender info and messages

### Smart Contract Features
- Event emission for all tips (`Tipped` event)
- Owner-only withdrawal functionality
- Tip storage with sender, amount, message, and timestamp
- Balance and tip count queries
- Complete tip history retrieval

## 📁 Project Structure

```
tipjar/
├── contracts/
│   └── TipJar.sol              # Main smart contract
├── scripts/
│   └── deploy.js               # Deployment script
├── frontend/
│   └── index.html              # Frontend interface
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- MetaMask or Coinbase Wallet browser extension
- Base Sepolia testnet ETH (get from [faucet](https://bridge.base.org/))

### 1. Clone and Install

```bash
git clone <repository-url>
cd tipjar
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` file with your values:
```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

⚠️ **Security Note**: Never commit your `.env` file or share your private key!

### 3. Compile Contract

```bash
npm run compile
```

### 4. Deploy to Base Sepolia

```bash
npm run deploy
```

After deployment, copy the contract address from the console output.

### 5. Update Frontend

Edit `frontend/index.html` and replace the `CONTRACT_ADDRESS` variable with your deployed contract address:

```javascript
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

### 6. Run Frontend

```bash
npm run frontend
```

Visit `http://localhost:8000` to use the application.

## 🔧 Development

### Local Development

1. Start local Hardhat node:
```bash
npm run node
```

2. Deploy to local network:
```bash
npm run deploy:local
```

3. Update frontend with local contract address and run frontend server.

### Testing

```bash
npm test
```

## 🌐 Base Sepolia Network Setup

### Add Base Sepolia to MetaMask

- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.basescan.org

### Get Testnet ETH

1. Get Ethereum Sepolia ETH from [Sepolia faucet](https://sepoliafaucet.com/)
2. Bridge to Base Sepolia using [Base Bridge](https://bridge.base.org/)

## 📖 Usage Guide

### For Tippers

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Send Tip**: 
   - Enter tip amount in ETH (minimum 0.001 ETH)
   - Write a message
   - Click "Send Tip" and confirm transaction
3. **View Status**: Transaction status will be displayed in real-time

### For Contract Owner

1. **Deploy Contract**: The deploying wallet becomes the owner
2. **Withdraw Tips**: Use "Withdraw All Tips" button to withdraw the contract balance
3. **Monitor Activity**: View tip history and contract statistics

## 🔍 Contract Verification

The deploy script automatically attempts to verify the contract on Basescan. You can also manually verify:

```bash
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS
```

## 🚧 Future Improvements (BONUS Features)

- **USDC Support**: Add ERC20 token tip functionality
- **Enhanced History**: Pagination and filtering for tip history
- **Address Storage**: Store message history by sender address  
- **Split Tipping**: Allow tipping to multiple addresses
- **Tip Categories**: Categorize tips by purpose
- **Withdrawal Schedules**: Time-locked withdrawals
- **Tip Goals**: Set and track tip targets

## 🐛 Troubleshooting

### Common Issues

1. **"Please switch to Base Sepolia"**: Ensure MetaMask is connected to Base Sepolia testnet
2. **Transaction Failures**: Check you have enough ETH for gas fees
3. **Contract Not Found**: Verify the contract address is correct in frontend
4. **Connection Issues**: Try refreshing page and reconnecting wallet

### Getting Help

- Check [Base documentation](https://docs.base.org/)
- Review [Hardhat documentation](https://hardhat.org/docs)
- Inspect browser console for detailed error messages

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines and submit pull requests.

---

Built with ❤️ for the Web3 community. Happy tipping! 🎉