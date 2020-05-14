pragma solidity >=0.5.0 <0.6.0;

import './Synth.sol';

contract Synthex is ERC20 {
    address public owner;

    string public constant name = "Synthex Token";
    string public constant symbol = "SYX";
    uint8 public constant decimals = 18;
    
    mapping (bytes32 => Synth) public synths;

    bytes32 private constant sUSD = "sUSD";
    
    constructor(uint initialSupply) public {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
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

