pragma solidity >=0.5.0 <0.6.0;

import './Synth.sol';

contract Synthex {
    address public owner;
    ERC20 public token;

    string public constant name = "Synthex Token";
    string public constant symbol = "SYX";
    uint8 public constant decimals = 18;
    
    mapping (bytes32 => Synth) public synths;
    
    uint public totalDebt;
    
    uint[] public debtLedger;

    bytes32 private constant sUSD = "sUSD";
    
    uint public constant UNIT = 1000000;
    
    constructor(ERC20 _token) public {
        owner = msg.sender;
        token = _token;
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
        
        uint newTotalDebt = totalDebt + amount;
        
        uint debtPercentaje = amount * UNIT / newTotalDebt;
        uint delta = UNIT - debtPercentaje;
        
        if (totalDebt == 0)
            debtLedger.push(UNIT);
        else
            debtLedger.push(delta);
        
        totalDebt = newTotalDebt;
    }
    
    function burnSynths(uint amount) public {
        synths[sUSD].burn(msg.sender, amount);
        totalDebt -= amount;
    }
}

