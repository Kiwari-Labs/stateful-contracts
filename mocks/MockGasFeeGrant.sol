// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AbstractGasFeeGrant} from "../contracts/abstracts/AbstractGasFeeGrant.sol";
import {IGasFeeGrant} from "../contracts/interfaces/IGasFeeGrant.sol";

interface IGasFeeGrantHelper {
    function manipulateStartTime(address grantee, address program, uint256 blockNumber) external;
    function manipulateEndTime(address grantee, address program, uint256 blockNumber) external;
    function manipulateLatestTransaction(address grantee, address program, uint256 blockNumber) external;
    function manipulateSpendPeriod(address grantee, address program, uint256 value) external;
}

contract MockGasFeeGrant is AbstractGasFeeGrant {
    IGasFeeGrantHelper private _precompiled;

    constructor(address precompiled, address admin) AbstractGasFeeGrant(precompiled, admin) {
        _initialPrecompileOwner(address(this));
        _precompiled = IGasFeeGrantHelper(precompiled);
    }

    function setFeeGrant(
        address granter,
        address grantee,
        address program,
        uint256 spendLimit,
        uint32 period,
        uint256 periodLimit,
        uint256 endTime
    ) public onlyAdmin {
        _setFeeGrant(granter, grantee, program, spendLimit, period, periodLimit, endTime);
    }

    function revokeFeeGrant(address grantee, address program) public onlyAdmin {
        _revokeFeeGrant(grantee, program);
    }

    function manipulateStartTime(address grantee, address program, uint256 blockNumber) public {
        _precompiled.manipulateStartTime(grantee, program, blockNumber);
    }

    function manipulateEndTime(address grantee, address program, uint256 blockNumber) public {
        _precompiled.manipulateEndTime(grantee, program, blockNumber);
    }

    function manipulateLatestTransaction(address grantee, address program, uint256 blockNumber) public {
        _precompiled.manipulateLatestTransaction(grantee, program, blockNumber);
    }

    function manipulateSpendPeriod(address grantee, address program, uint256 value) public {
        _precompiled.manipulateSpendPeriod(grantee, program, value);
    }
}
