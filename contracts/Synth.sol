pragma solidity >=0.5.0 <0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Synth is ERC20 {
    address public owner;
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    bytes32 public key;
    
    address public synthex;
    
    constructor(string memory _symbol, string memory _name, bytes32 _key) public {
        owner = msg.sender;
        
        symbol = _symbol;
        name = _name;
        key = _key;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlySynthex {
        require(msg.sender == synthex);
        _;
    }

    function setSynthex(address _synthex) public onlyOwner {
        synthex = _synthex;
    }
    
    function issue(address account, uint amount) public onlySynthex {
        _mint(account, amount);
    }
}
