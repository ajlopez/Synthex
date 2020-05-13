pragma solidity >=0.5.0 <0.6.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Synth is ERC20 {
    address public owner;
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    bytes32 public key;
    
    address public synthex;
    address public synthExchange;
    
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
