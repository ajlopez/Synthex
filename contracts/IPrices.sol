// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

interface IPrices {
    function MANTISSA() external view returns (uint);
    function prices(bytes32 key) external view returns (uint);
}

