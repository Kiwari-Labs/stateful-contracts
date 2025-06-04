// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AbstractAddressRegistry} from "../contracts/abstracts/AbstractAddressRegistry.sol";

contract MockAddressRegistry is AbstractAddressRegistry {
    constructor(address precompiled, address admin) AbstractAddressRegistry(precompiled, admin) {
        _initialPrecompileOwner(address(this));
    }

    function addToRegistry(address account, address initiator) public onlyAdmin {
        _addToRegistry(account, initiator);
    }

    function removeFromRegistry(address account, address initiator) public onlyAdmin {
        _removeFromRegistry(account, initiator);
    }
}
