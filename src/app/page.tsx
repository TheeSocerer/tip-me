'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Coins, Wallet, Send, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react'

// ===== CONTRACT CONFIGURATION =====
// Replace this with your actual deployed contract address
const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual deployed contract address

// Contract ABI (Application Binary Interface) - defines how to interact with the contract
const CONTRACT_ABI = [
  "function tip(string memory _message) external payable",
  "function withdraw() external",
  "function getBalance() external view returns (uint256)",
  "function getTipCount() external view returns (uint256)",
  "function getAllTips() external view returns (tuple(address sender, uint256 amount, string message, uint256 timestamp)[])",
  "function owner() external view returns (address)",
  "event Tipped(address indexed sender, uint256 amount, string message, uint256 timestamp)",
  "event Withdrawn(address indexed owner, uint256 amount, uint256 timestamp)"
]

// TypeScript interfaces for type safety
interface Tip {
  sender: string
  amount: ethers.BigNumber
  message: string
  timestamp: ethers.BigNumber
}

interface StatusMessage {
  text: string
  type: 'success' | 'error' | 'pending'
}

// Main application component
export default function TipJarApp() {
  // ===== STATE MANAGEMENT =====
  // Wallet and Web3 connection state
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  
  // Contract data state
  const [contractBalance, setContractBalance] = useState<string>('0')
  const [tipCount, setTipCount] = useState<string>('0')
  const [recentTips, setRecentTips] = useState<Tip[]>([])
  
  // Form input state
  const [tipAmount, setTipAmount] = useState<string>('')
  const [tipMessage, setTipMessage] = useState<string>('')
  
  // UI state
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // ===== WALLET CONNECTION LOGIC =====
  // Function to connect user's wallet to the application
  const connectWallet = async () => {
    try {
      // Check if Web3 wallet is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or Coinbase Wallet!')
      }

      setIsLoading(true)
      showStatus('Connecting wallet...', 'pending')

      // Request access to user's wallet accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      // Create provider and signer for blockchain interactions
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      const web3Signer = web3Provider.getSigner()
      const address = await web3Signer.getAddress()

      // Verify user is on the correct network (Base Sepolia)
      const network = await web3Provider.getNetwork()
      if (network.chainId !== 84532) {
        throw new Error('Please switch to Base Sepolia testnet (Chain ID: 84532)')
      }

      // Create contract instance for making calls
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer)

      // Update state with connection info
      setProvider(web3Provider)
      setSigner(web3Signer)
      setContract(contractInstance)
      setUserAddress(address)
      setIsConnected(true)

      // Check if connected user is the contract owner
      const owner = await contractInstance.owner()
      setIsOwner(owner.toLowerCase() === address.toLowerCase())

      // Load initial contract data
      await updateContractInfo(contractInstance)
      await loadRecentTips(contractInstance)

      showStatus('Wallet connected successfully!', 'success')

      // Set up listeners for wallet changes
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      showStatus(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // ===== TIP SENDING FUNCTIONALITY =====
  // Function to send a tip with message to the contract
  const sendTip = async () => {
    if (!contract || !tipAmount || !tipMessage.trim()) {
      showStatus('Please fill in all fields', 'error')
      return
    }

    try {
      // Validate input values
      if (parseFloat(tipAmount) <= 0) {
        throw new Error('Please enter a valid tip amount')
      }

      setIsLoading(true)
      showStatus('Sending tip...', 'pending')

      // Call the contract's tip function with ETH value
      const tx = await contract.tip(tipMessage, {
        value: ethers.utils.parseEther(tipAmount)
      })

      showStatus('Transaction submitted! Waiting for confirmation...', 'pending')

      // Wait for transaction to be mined
      await tx.wait()

      showStatus('Tip sent successfully! 🎉', 'success')

      // Reset the form after successful tip
      setTipAmount('')
      setTipMessage('')

      // Refresh displayed data
      await updateContractInfo(contract)
      await loadRecentTips(contract)

    } catch (error: any) {
      console.error('Error sending tip:', error)
      showStatus(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // ===== WITHDRAWAL FUNCTIONALITY (OWNER ONLY) =====
  // Function for contract owner to withdraw all accumulated tips
  const withdrawTips = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      showStatus('Withdrawing tips...', 'pending')

      // Call the contract's withdraw function
      const tx = await contract.withdraw()

      showStatus('Transaction submitted! Waiting for confirmation...', 'pending')

      // Wait for transaction to be mined
      await tx.wait()

      showStatus('Tips withdrawn successfully! 💰', 'success')

      // Update displayed contract balance
      await updateContractInfo(contract)

    } catch (error: any) {
      console.error('Error withdrawing tips:', error)
      showStatus(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // ===== CONTRACT DATA FUNCTIONS =====
  // Function to fetch and display current contract information
  const updateContractInfo = async (contractInstance: ethers.Contract) => {
    try {
      // Get current contract balance and tip count
      const balance = await contractInstance.getBalance()
      const count = await contractInstance.getTipCount()

      // Update the displayed information
      setContractBalance(ethers.utils.formatEther(balance))
      setTipCount(count.toString())

    } catch (error) {
      console.error('Error updating contract info:', error)
    }
  }

  // Function to load and display recent tips from the contract
  const loadRecentTips = async (contractInstance: ethers.Contract) => {
    try {
      // Get all tips from the contract
      const tips = await contractInstance.getAllTips()

      // Show last 5 tips in reverse order (newest first)
      const recentTipsArray = tips.slice(-5).reverse()
      setRecentTips(recentTipsArray)

    } catch (error) {
      console.error('Error loading tips:', error)
    }
  }

  // ===== UI HELPER FUNCTIONS =====
  // Function to display status messages to the user
  const showStatus = (text: string, type: 'success' | 'error' | 'pending') => {
    setStatusMessage({ text, type })

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        setStatusMessage(null)
      }, 5000)
    }
  }

  // ===== WALLET EVENT HANDLERS =====
  // Handle when user switches accounts in their wallet
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet - reset state
      window.location.reload()
    } else {
      // User switched accounts - reload page to reconnect
      window.location.reload()
    }
  }

  // Handle when user switches networks in their wallet
  const handleChainChanged = () => {
    // Reload page when network changes
    window.location.reload()
  }

  // ===== COMPONENT RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Coins className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gradient">Onchain Tip Jar</h1>
          </div>
          <p className="text-gray-600 text-lg">Send tips with messages on Base Sepolia testnet</p>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
            Base Sepolia Testnet | Chain ID: 84532
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-6 flex items-center p-4 rounded-lg ${
            statusMessage.type === 'success' ? 'status-success' :
            statusMessage.type === 'error' ? 'status-error' : 'status-pending'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
            {statusMessage.type === 'pending' && <Clock className="w-5 h-5 mr-2" />}
            {statusMessage.text}
          </div>
        )}

        {/* Wallet Connection Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800">
                  {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
                </h3>
                {isConnected && (
                  <p className="text-sm text-gray-600 font-mono">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </p>
                )}
              </div>
            </div>
            {!isConnected && (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="btn-primary flex items-center"
              >
                {isLoading && <div className="loading-spinner mr-2" />}
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Contract Information */}
        {isConnected && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Contract Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Contract Address</p>
                <p className="font-mono text-sm text-gray-800">
                  {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="font-semibold text-lg text-blue-600">{contractBalance} ETH</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Tips</p>
                <p className="font-semibold text-lg text-purple-600">{tipCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tip Form */}
        {isConnected && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Send className="w-6 h-6 mr-2" />
              Send a Tip
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="0.01"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  placeholder="Thanks for the great work! 🎉"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <button
                onClick={sendTip}
                disabled={isLoading || !tipAmount || !tipMessage.trim()}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isLoading && <div className="loading-spinner mr-2" />}
                Send Tip
              </button>
            </div>
          </div>
        )}

        {/* Owner Section */}
        {isConnected && isOwner && (
          <div className="card mb-8 border-yellow-200 bg-yellow-50">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Download className="w-6 h-6 mr-2" />
              👑 Owner Actions
            </h3>
            <button
              onClick={withdrawTips}
              disabled={isLoading || contractBalance === '0.0'}
              className="btn-primary flex items-center"
            >
              {isLoading && <div className="loading-spinner mr-2" />}
              Withdraw All Tips
            </button>
          </div>
        )}

        {/* Recent Tips */}
        {isConnected && recentTips.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">📜 Recent Tips</h3>
            <div className="space-y-4">
              {recentTips.map((tip, index) => {
                const date = new Date(tip.timestamp.toNumber() * 1000)
                const senderDisplay = tip.sender.toLowerCase() === userAddress?.toLowerCase() ? 
                  'You' : `${tip.sender.slice(0, 6)}...${tip.sender.slice(-4)}`
                
                return (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">From: {senderDisplay}</span>
                      <span className="font-semibold text-blue-600">
                        {ethers.utils.formatEther(tip.amount)} ETH
                      </span>
                    </div>
                    <p className="text-gray-800 italic">"{tip.message}"</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {date.toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isConnected && recentTips.length === 0 && (
          <div className="card text-center">
            <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tips yet</h3>
            <p className="text-gray-500">Be the first to send a tip! 🎉</p>
          </div>
        )}
      </div>
    </div>
  )
}