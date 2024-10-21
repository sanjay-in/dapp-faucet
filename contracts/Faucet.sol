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
    uint256 private constant DECIMAL_PRECISION = 1e18;
    uint256 private constant TIME_PRECISION = 1 minutes;
    address payable public immutable i_owner;
    IERC20 public token;
    uint256 public s_lockTime;
    uint256 public s_withdrawAmount;
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
    /**
     * @notice Checks for valid address, withdraw amount greater than total token balance,
     * time passed for the address
     * Maps address to next withdrawal time and transfers token
     * @param receiver address where the token should be transfered
     */
    function requestToken(address receiver) external {
        if (receiver == address(0)) {
            revert Faucet__InvalidAddress();
        }
        if (token.balanceOf(address(this)) < s_withdrawAmount) {
            revert Faucet__InsufficientBalanceInFaucet();
        }
        if (block.timestamp < s_nextAccessTime[receiver]) {
            revert Faucet__TimeNotPassedForWithdraw();
        }

        s_nextAccessTime[receiver] = block.timestamp + s_lockTime;
        token.transfer(receiver, s_withdrawAmount);
    }

    /**
     * @notice Checks if only owner of contract can access and valid withdrawal address
     * Transfers remaining token to the owner of the contract
     * Emits Withdrawn event with balance of tokens and time of transfer
     */
    function withdraw() external onlyOwner {
        if (msg.sender == address(0)) {
            revert Faucet__InvalidAddress();
        }
        uint256 balance = token.balanceOf(address(this));
        token.transfer(msg.sender, balance);
        emit Withdrawn(balance, block.timestamp);
    }

    /**
     * @notice Sets the time limit of next withdrawal
     * Checks if only owner can call the function
     * @param time Time in minutes
     */
    function setLockTime(uint256 time) external onlyOwner {
        s_lockTime = time * TIME_PRECISION;
    }

    /**
     * @notice Change the amount of tokens an address can receive
     * Checks if only owner can call the function
     * @param amount number of tokens
     */
    function setWithdrawAmount(uint256 amount) external onlyOwner {
        s_withdrawAmount = amount * DECIMAL_PRECISION;
    }
}
