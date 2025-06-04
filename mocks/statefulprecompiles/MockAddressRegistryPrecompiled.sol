// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Mock Address Registry Precompiled Contract
 * @author Kiwari Labs
 * @notice This contract use for mock as stateful-precompile contract purpose only.
 */

import {IAddressRegistry} from "../../contracts/interfaces/IAddressRegistry.sol";

contract MockAddressRegistryPrecompiled is IAddressRegistry {
    bool private _init;
    address private _owner;

    mapping(address => address) private _registry;

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

    /** AddressRegistry */
    function contains(address account) external view returns (bool) {
        return _registry[account] != address(0);
    }

    function discovery(address account) external view returns (address) {
        return _registry[account];
    }

    function addToRegistry(address to, address initiator) external override returns (bool) {
        if (_checkOwner()) {
            if (to == address(0) || _registry[to] != address(0)) return false;
            _registry[to] = initiator;

            return true;
        } else {
            return false;
        }
    }

    function removeFromRegistry(address to) external override returns (bool) {
        if (_checkOwner()) {
            _registry[to] = address(0);
            return true;
        } else {
            return false;
        }
    }
}
