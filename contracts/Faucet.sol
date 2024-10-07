// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Faucet {
    // Errors
    error Faucet__NotOwner();
    error Faucet__InvalidAddress();
    error Faucet__InsufficientBalanceInFaucet();
    error Faucet__TimeNotPassedForWithdraw();

    // Events
    event Withdrawn(uint256 amount, uint256 time);

    // State variables
    uint256 private constant DECIMAL_PRECISION = 10e18;
    uint256 private constant TIME_PRECISION = 1 minutes;
    address payable private immutable i_owner;
    IERC20 private token;
    uint256 private s_lockTime;
    uint256 private s_withdrawAmount;
    mapping(address => uint256) private s_nextAccessTime;

    // Modifiers
    modifier onlyOwner() {
        if (i_owner != msg.sender) {
            revert Faucet__NotOwner();
        }
        _;
    }

    // Constructor
    constructor(
        address tokenAddress,
        uint256 lockTime,
        uint256 withdrawAmount
    ) {
        i_owner = payable(msg.sender);
        token = IERC20(tokenAddress);
        s_lockTime = lockTime * TIME_PRECISION;
        s_withdrawAmount = withdrawAmount * DECIMAL_PRECISION;
    }

    // External Functions
    function requestToken() external {
        if (msg.sender == address(0)) {
            revert Faucet__InvalidAddress();
        }
        if (token.balanceOf(address(this)) < s_withdrawAmount) {
            revert Faucet__InsufficientBalanceInFaucet();
        }
        if (block.timestamp < s_nextAccessTime[msg.sender]) {
            revert Faucet__TimeNotPassedForWithdraw();
        }

        s_nextAccessTime[msg.sender] = block.timestamp + s_lockTime;
        token.transfer(msg.sender, s_withdrawAmount);
    }

    function withdraw() external onlyOwner {
        if (msg.sender == address(0)) {
            revert Faucet__InvalidAddress();
        }
        uint256 balance = token.balanceOf(address(this));
        token.transfer(msg.sender, balance);
        emit Withdrawn(balance, block.timestamp);
    }

    function setLockTime(uint256 time) external onlyOwner {
        s_lockTime = time * TIME_PRECISION;
    }

    function setWithdrawAmount(uint256 amount) external onlyOwner {
        s_withdrawAmount = amount * DECIMAL_PRECISION;
    }
}
