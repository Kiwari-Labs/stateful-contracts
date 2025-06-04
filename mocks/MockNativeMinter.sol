// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AbstractNativeMinter} from "../contracts/abstracts/AbstractNativeMinter.sol";

contract MockNativeMinter is AbstractNativeMinter {
    constructor(address precompiled, address admin) AbstractNativeMinter(precompiled, admin) {
        _initialPrecompileOwner(address(this));
    }

    function mint(address to, uint256 value) public onlyAdmin {
        _mint(to, value);
    }
}
