pragma solidity >=0.5.0 <0.6.0;

contract SynthExchange {
    address public owner;
    address public synthex;
    
    mapping (bytes32 => uint) public prices;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function setSynthex(address _synthex) public onlyOwner {
        synthex = _synthex;
    }
}