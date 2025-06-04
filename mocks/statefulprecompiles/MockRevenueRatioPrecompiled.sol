// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Mock Revenue Ratio Precompiled Contract
 * @author Kiwari Labs
 * @notice This contract use for mock as stateful-precompile contract purpose only.
 */

import {IRevenueRatio} from "../../contracts/interfaces/IRevenueRatio.sol";

contract MockRevenueRatioPrecompiled is IRevenueRatio {
    bool private _init;
    address private _owner;

    bool private _status;
    uint8 private _contractRatio;
    uint8 private _coinbaseRatio;
    uint8 private _providerRatio;
    uint8 private _treasuryRatio;

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

    /** RevenueRatio */
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

    function contractRatio() public view returns (uint256) {
        return _contractRatio;
    }

    function coinbaseRatio() public view returns (uint256) {
        return _coinbaseRatio;
    }

    function providerRatio() public view returns (uint256) {
        return _providerRatio;
    }

    function treasuryRatio() public view returns (uint256) {
        return _providerRatio;
    }

    function setRevenueRatio(
        uint8 contractRatio,
        uint8 coinbaseRatio,
        uint8 providerRatio,
        uint8 treasuryRatio
    ) external override returns (bool) {
        if (_checkOwner()) {
            if (_status) return false;
            uint8 totalRatio = contractRatio + coinbaseRatio + providerRatio + treasuryRatio;
            if (totalRatio < 100 || totalRatio > 100) return false;
            _contractRatio = contractRatio;
            _coinbaseRatio = coinbaseRatio;
            _providerRatio = providerRatio;
            _treasuryRatio = _treasuryRatio;

            return true;
        } else {
            return false;
        }
    }
}
