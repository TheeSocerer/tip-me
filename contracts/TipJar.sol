// SPDX-License-Identifier: MIT
// This smart contract creates a tip jar where users can send ETH tips with messages
// Only the contract owner (deployer) can withdraw the accumulated tips
pragma solidity ^0.8.19;

contract TipJar {
    // State variables to store contract data
    address public owner;
    uint256 public totalTips; // Total amount of ETH received in tips
    
    // Struct to store information about each tip
    struct Tip {
        address sender;    // Who sent the tip
        uint256 amount;    // How much ETH was sent
        string message;    // Message attached to the tip
        uint256 timestamp; // When the tip was sent
    }
    
    // Array to store all tips received
    Tip[] public tips;
    
    // Events are emitted when important actions happen
    // Frontend can listen to these events for real-time updates
    event Tipped(
        address indexed sender,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    
    event Withdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    
    // Modifier to restrict certain functions to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can withdraw");
        _;
    }
    
    // Constructor runs once when contract is deployed
    constructor() {
        owner = msg.sender;
    }
    
    // Function for users to send tips with messages
    // 'payable' means this function can receive ETH
    function tip(string memory _message) external payable {
        // Ensure the tip amount is greater than 0
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        // Store the tip information in our array
        tips.push(Tip({
            sender: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        }));
        
        // Add to total tips counter
        totalTips += msg.value;
        
        // Emit event so frontend can detect the tip
        emit Tipped(msg.sender, msg.value, _message, block.timestamp);
    }
    
    // Function for owner to withdraw all accumulated tips
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        // Transfer all ETH in contract to owner
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        // Emit event for withdrawal
        emit Withdrawn(owner, balance, block.timestamp);
    }
    
    // View function to check contract's ETH balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // View function to get total number of tips received
    function getTipCount() external view returns (uint256) {
        return tips.length;
    }
    
    // View function to get a specific tip by index
    function getTip(uint256 _index) external view returns (
        address sender,
        uint256 amount,
        string memory message,
        uint256 timestamp
    ) {
        // Make sure the index exists
        require(_index < tips.length, "Tip index out of bounds");
        Tip memory tip = tips[_index];
        return (tip.sender, tip.amount, tip.message, tip.timestamp);
    }
    
    // View function to get all tips at once (for frontend display)
    function getAllTips() external view returns (Tip[] memory) {
        return tips;
    }
}