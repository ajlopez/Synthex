// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Synth is ERC20 {
    address public owner;
    bytes32 public key;
    
    address public synthex;
    address public synthExchange;
    
    constructor(string memory _symbol, string memory _name, bytes32 _key) ERC20(_name, _symbol) public {
        owner = msg.sender;
        
        key = _key;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlySynthexOrSynthExchange {
        require(msg.sender == synthex || msg.sender == synthExchange);
        _;
    }

    function setSynthex(address _synthex) public onlyOwner {
        synthex = _synthex;
    }
    
    function setSynthExchange(address _synthExchange) public onlyOwner {
        synthExchange = _synthExchange;
    }
    
    function issue(address account, uint amount) public onlySynthexOrSynthExchange {
        _mint(account, amount);
    }
    
    function burn(address account, uint amount) public onlySynthexOrSynthExchange {
        _burn(account, amount);
    }
}
