// SPDX-License-Identifier: SEE LICENSE IN LICENSE

pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract RedToken is ERC20Capped {
    address payable public immutable i_owner;
    uint256 private immutable i_decimals;
    uint256 private s_blockReward;

    // Errors
    error RedToken__NotOwner();
    error RedToken__MaxCapExceeded();

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert RedToken__NotOwner();
        }
        _;
    }

    // Constructor
    constructor(
        uint256 cap,
        uint256 initialSupply,
        uint256 blockReward
    ) ERC20("RedToken", "RDT") ERC20Capped(cap * (10 ** decimals())) {
        i_owner = payable(msg.sender);
        i_decimals = 10 ** decimals();
        s_blockReward = blockReward * i_decimals;
        _mint(i_owner, initialSupply * i_decimals);
    }

    function _mint(address account, uint256 value) internal virtual override {
        if (totalSupply() + value > cap()) {
            revert RedToken__MaxCapExceeded();
        }
        super._mint(account, value);
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase, s_blockReward);
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        if (to != block.coinbase && totalSupply() + s_blockReward <= cap()) {
            _mintMinerReward();
        }
        super._transfer(from, to, value);
    }

    function setBlockReward(uint256 reward) external {
        s_blockReward = reward * i_decimals;
    }

    function destroy() external onlyOwner {
        selfdestruct(payable(i_owner));
    }
}
