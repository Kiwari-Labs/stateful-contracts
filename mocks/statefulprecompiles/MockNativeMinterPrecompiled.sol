// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Mock Native Minter Precompiled Contract
 * @author Kiwari Labs
 * @notice This contract use for mock as stateful-precompile contract purpose only.
 */

import {INativeMinter} from "../../contracts/interfaces/INativeMinter.sol";

contract MockNativeMinterPrecompiled is INativeMinter {
    bool private _init;
    address private _owner;

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

    /** Mint */
    function mint(address to, uint256 value) external override returns (bool) {
        if (_checkOwner()) {
            if (to == address(0) || value == 0) return false;
            (bool success, ) = payable(to).call{value: value}("");
            require(success, "Failed to send Ether");

            return true;
        } else {
            return false;
        }
    }
}
