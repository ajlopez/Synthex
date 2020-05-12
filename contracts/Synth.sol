pragma solidity >=0.5.0 <0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Synth is ERC20 {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    bytes32 public key;
    
    constructor(string memory _symbol, string memory _name, bytes32 _key) public {
        symbol = _symbol;
        name = _name;
        key = _key;
    }
}
