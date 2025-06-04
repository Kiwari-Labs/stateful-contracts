// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Mock Treasury Registry Precompiled Contract
 * @author Kiwari Labs
 * @notice This contract use for mock as stateful-precompile contract purpose only.
 */

import {ITreasuryRegistry} from "../../contracts/interfaces/ITreasuryRegistry.sol";

contract MockTreasuryRegistryAPrecompiled is ITreasuryRegistry {
    bool private _init;
    address private _owner;

    address private _treasury;

    /** Ownable */
    function _checkOwner() internal view returns (bool) {
        return msg.sender == _owner;
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function initialized() external view returns (bool) {
        return _init;
    }

    function initializeOwner(address initialOwner) external returns (bool) {
        if (_init) return false;
        _init = true;
        _owner = initialOwner;
        return true;
    }

    function transferOwnership(address newOwner) external returns (bool) {
        if (newOwner == address(0)) return false;
        _owner = newOwner;
        return true;
    }

    /** TreasuryRegistry */
    function treasuryAt() public view returns (address) {
        return _treasury;
    }

    function setTreasury(address newTreasury) external override returns (bool) {
        if (_checkOwner()) {
            if (newTreasury == address(0)) return false;
            _treasury = newTreasury;

            return true;
        } else {
            return false;
        }
    }
}
