// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../RedToken.sol";

contract TestToken is RedToken {
    constructor(
        uint256 cap,
        uint256 initialSupply,
        uint256 blockReward
    ) RedToken(cap, initialSupply, blockReward) {}

    function testMint(address account, uint256 amount) public {
        super.mint(account, amount);
    }

    function testMintMinerReward() public {
        super._mintMinerReward();
    }

    function testTransfer(address from, address to, uint256 value) public {
        super.transfer(from, to, value);
    }
}
