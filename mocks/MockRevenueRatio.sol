// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AbstractRevenueRatio} from "../contracts/abstracts/AbstractRevenueRatio.sol";

contract MockRevenueRatio is AbstractRevenueRatio {
    constructor(address precompiled, address admin) AbstractRevenueRatio(precompiled, admin) {
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

    function setRevenueRatio(uint8 contractRatio, uint8 coinbaseRatio, uint8 providerRatio, uint8 treasuryRatio) public onlyAdmin {
        _setRevenueRatio(contractRatio, coinbaseRatio, providerRatio, treasuryRatio);
    }
}
