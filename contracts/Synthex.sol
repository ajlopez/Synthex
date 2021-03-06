// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import './Synth.sol';
import './IPrices.sol';

contract Synthex {
    address public owner;
    ERC20 public token;
    IPrices public prices;

    string public constant name = "Synthex Token";
    string public constant symbol = "SYX";
    uint8 public constant decimals = 18;
    
    Synth[] public availableSynths;
    mapping (bytes32 => Synth) public synths;
    
    uint public debtIndex;

    struct IssuanceData {
        uint initialDebtOwnership;
        uint debtIndex;
    }
    
    mapping(address => IssuanceData) public issuanceData;
    
    bytes32 private constant sUSD = "sUSD";
    
    uint public constant UNIT = 1000000;
    
    constructor(ERC20 _token, IPrices _prices) public {
        owner = msg.sender;
        token = _token;
        prices = _prices;
        debtIndex = UNIT;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
    
    function addSynth(Synth synth) public onlyOwner {
        bytes32 key = synth.key();
        
        require(synths[key] == Synth(0), "Synth already exists");
        
        synths[key] = synth;
        availableSynths.push(synth);
    }
    
    function issueSynths(uint amount) public {
        uint initialTotalDebt = totalIssuedSynthsValue();
        
        synths[sUSD].issue(msg.sender, amount);

        uint increment = amount * prices.prices(sUSD);
        uint newTotalDebt = initialTotalDebt + increment;
        
        uint debtPercentaje = increment * UNIT / newTotalDebt;
        
        if (initialTotalDebt == 0)
            debtIndex = UNIT;
        else
            debtIndex = newTotalDebt * debtIndex / initialTotalDebt;
        
        issuanceData[msg.sender].initialDebtOwnership = debtPercentaje;
        issuanceData[msg.sender].debtIndex = debtIndex;
    }
    
    function burnSynths(uint amount) public {
        synths[sUSD].burn(msg.sender, amount);
    }
    
    function totalIssuedSynthsValue() public view returns (uint) {
        uint total;
        
        for (uint k = 0; k < availableSynths.length; k++) {
            uint totalSupply = availableSynths[k].totalSupply();
            uint price = prices.prices(availableSynths[k].key());
            
            total += totalSupply * price;
        }
        
        return total;
    }
}

