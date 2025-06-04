// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Mock GasPrice Precompiled Contract
 * @author Kiwari Labs
 * @notice This contract use for mock as stateful-precompile contract purpose only.
 */

import {IGasPrice} from "../../contracts/interfaces/IGasPrice.sol";

contract MockGasPricePrecompiled is IGasPrice {
    bool private _init;
    address private _owner;

    bool private _status;
    uint256 private _gasPrice;

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

    /** GasPrice */
    function gasPrice() external view returns (uint256) {
        return _gasPrice;
    }

    function status() external view returns (bool) {
        return _status;
    }

    function enable() external override returns (bool) {
        if (_checkOwner()) {
            if (_status) return false;
            _status = true;
            return true;
        } else {
            return false;
        }
    }

    function disable() external override returns (bool) {
        if (_checkOwner()) {
            if (!_status) return false;
            _status = false;

            return true;
        } else {
            return false;
        }
    }

    function setGasPrice(uint256 newGasPrice) external override returns (bool) {
        if (_checkOwner()) {
            if (_status) return false;
            _gasPrice = newGasPrice;

            return true;
        } else {
            return false;
        }
    }
}
