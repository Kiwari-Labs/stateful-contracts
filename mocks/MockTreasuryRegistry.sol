// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AbstractTreasuryRegistry} from "../contracts/abstracts/AbstractTreasuryRegistry.sol";

contract MockTreasuryRegistry is AbstractTreasuryRegistry {
    constructor(address precompiled, address admin) AbstractTreasuryRegistry(precompiled, admin) {
        _initialPrecompileOwner(address(this));
    }

    function setTreasury(address newTreasury) public onlyAdmin {
        _setTreasury(newTreasury);
    }
}
