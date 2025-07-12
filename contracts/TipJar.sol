// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TipJar {
    address public owner;
    uint256 public totalTips;
    
    struct Tip {
        address sender;
        uint256 amount;
        string message;
        uint256 timestamp;
    }
    
    Tip[] public tips;
    
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
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can withdraw");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function tip(string memory _message) external payable {
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        tips.push(Tip({
            sender: msg.sender,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        }));
        
        totalTips += msg.value;
        
        emit Tipped(msg.sender, msg.value, _message, block.timestamp);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(owner, balance, block.timestamp);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTipCount() external view returns (uint256) {
        return tips.length;
    }
    
    function getTip(uint256 _index) external view returns (
        address sender,
        uint256 amount,
        string memory message,
        uint256 timestamp
    ) {
        require(_index < tips.length, "Tip index out of bounds");
        Tip memory tip = tips[_index];
        return (tip.sender, tip.amount, tip.message, tip.timestamp);
    }
    
    function getAllTips() external view returns (Tip[] memory) {
        return tips;
    }
}