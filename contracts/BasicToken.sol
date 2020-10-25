// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BasicToken is ERC20 {
    uint constant _supply = 100000000000;
    
    constructor(string memory name, string memory symbol) ERC20(name, symbol) public {
        _mint(msg.sender, _supply);
    }
}
