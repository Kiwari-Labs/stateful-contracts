// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AbstractGasPrice} from "../contracts/abstracts/AbstractGasPrice.sol";

contract MockGasPrice is AbstractGasPrice {
    constructor(address precompiled, address admin) AbstractGasPrice(precompiled, admin) {
        _initialPrecompileOwner(address(this));
    }

    function enable() public onlyAdmin whenDisable returns (bool) {
        _setStatus(true);
        return true;
    }

    function disable() public onlyAdmin whenEnabled returns (bool) {
        _setStatus(false);
        return true;
    }

    function setGasPrice(uint256 newGasPrice) public onlyAdmin returns (bool) {
        _setGasPrice(newGasPrice);
        return true;
    }
}
