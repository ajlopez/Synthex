pragma solidity >=0.5.0 <0.6.0;

import './Synth.sol';

contract Synthex {
    address public owner;
    
    mapping (bytes32 => Synth) public synths;

    bytes32 private constant sUSD = "sUSD";
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
    
    function addSynth(Synth synth) public onlyOwner {
        bytes32 key = synth.key();
        
        require(synths[key] == Synth(0), "Synth already exists");
        
        synths[key] = synth;
    }
    
    function issueSynths(uint amount) public {
        synths[sUSD].issue(msg.sender, amount);
    }
    
    function burnSynths(uint amount) public {
        synths[sUSD].burn(msg.sender, amount);
    }
}

