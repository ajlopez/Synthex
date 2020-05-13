pragma solidity >=0.5.0 <0.6.0;

import "./Synthex.sol";

contract SynthExchange {
    address public owner;
    Synthex public synthex;
    
    mapping (bytes32 => uint) public prices;
    
    bytes32 private constant sUSD = "sUSD";
    uint public constant MANTISSA = 1e6;

    constructor() public {
        owner = msg.sender;
        prices[sUSD] = MANTISSA;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function setSynthex(Synthex _synthex) public onlyOwner {
        synthex = _synthex;
    }
    
    function setPrice(bytes32 key, uint price) public onlyOwner {
        require(synthex.synths(key) != Synth(0));
        
        prices[key] = price;
    }
    
    function exchange(bytes32 fromKey, uint amount, bytes32 toKey) public {
        require(amount > 0);
        require(prices[fromKey] > 0);
        require(prices[toKey] > 0);
        
        uint amount2 = amount * prices[fromKey] / prices[toKey];
        
        synthex.synths(fromKey).burn(msg.sender, amount);
        synthex.synths(toKey).issue(msg.sender, amount2);
    }
}

