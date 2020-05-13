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
}

