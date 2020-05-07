pragma solidity >=0.5.0 <0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BasicToken is ERC20 {
    string test = 'test';
    string public constant name = 'chaozding ERC20 Token';
    string public constant symbol = 'CZDT';
    uint8 public constant decimals = 4;
    uint constant _supply = 100000000000;
    
    constructor() public {
        _mint(msg.sender, _supply);
    }
}
