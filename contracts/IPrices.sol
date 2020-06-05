pragma solidity >=0.5.0 <0.6.0;

interface IPrices {
    function MANTISSA() external view returns (uint);
    function prices(bytes32 key) external view returns (uint);
}

