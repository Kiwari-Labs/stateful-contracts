// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Mock Gas Fee Grant Precompiled Contract
 * @author Kiwari Labs
 * @notice This contract use for mock as stateful-precompile contract purpose only.
 *         the transaction validation rule can not be done by the precompiled contract.
 */

import {IGasFeeGrant} from "../../contracts/interfaces/IGasFeeGrant.sol";

contract MockGasFeeGrantPrecompiled is IGasFeeGrant {
    bool private _init;
    address private _owner;

    mapping(address => mapping(address => Grant)) private _grants;

    /**
     * @dev the implementation client "MUST" set storage at grantee address following the {ERC-7201}.
     * @custom:storage-location erc7201:feegrant.flag
     */
    mapping(address => mapping(address => bool)) private _isGranteds;

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

    /** GasFeeGrant */
    function _isGranted(address grantee, address program) private view returns (bool) {
        return (_grants[grantee][address(0)].allowance != FEE_ALLOWANCE_TYPE.NON_ALLOWANCE ||
            _grants[grantee][program].allowance != FEE_ALLOWANCE_TYPE.NON_ALLOWANCE);
    }

    function _currentPeriod(address grantee, address program) private view returns (uint256) {
        uint256 initialBlockNumber = _grants[grantee][program].startTime;
        if (_grants[grantee][program].allowance == FEE_ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
            return ((block.number - initialBlockNumber) / _grants[grantee][program].period);
        }
    }

    function _update(
        address granter,
        address grantee,
        address program,
        uint256 spendLimit,
        uint32 period,
        uint256 periodLimit,
        uint256 endTime
    ) private {
        FEE_ALLOWANCE_TYPE allowance = FEE_ALLOWANCE_TYPE.BASIC_ALLOWANCE;
        if (spendLimit == 0 || granter == address(0) || grantee == address(0)) {
            return;
        } else if (period != 0 && periodLimit != 0) {
            if (spendLimit > periodLimit) {
                return;
            }
            uint256 firstPeriodReset = block.number + period;
            if (endTime != 0 && endTime < firstPeriodReset) {
                return;
            }
            allowance = FEE_ALLOWANCE_TYPE.PERIODIC_ALLOWANCE;
        }
        _grants[grantee][program].granter = granter;
        _grants[grantee][program].allowance = allowance;
        _grants[grantee][program].spendLimit = spendLimit;
        _grants[grantee][program].periodLimit = periodLimit;
        _grants[grantee][program].startTime = block.number;
        _grants[grantee][program].endTime = endTime;
        _grants[grantee][program].period = period;
        _grants[grantee][program].latestTransaction = block.number;
        _grants[grantee][program].periodCanSpend = periodLimit;
        _isGranteds[grantee][program] = true;
    }

    function setFeeGrant(
        address granter,
        address grantee,
        address program,
        uint256 spendLimit,
        uint32 period,
        uint256 periodLimit,
        uint256 endTime
    ) external returns (bool) {
        if (_checkOwner()) {
            if (_isGranted(grantee, program)) {
                return false;
            }
            _update(granter, grantee, program, spendLimit, period, periodLimit, endTime);

            return true;
        } else {
            return false;
        }
    }

    function revokeFeeGrant(address grantee, address program) external returns (bool) {
        if (_checkOwner()) {
            if (_isGranted(grantee, program)) {
                delete _grants[grantee][program];
                _isGranteds[grantee][program] = false;

                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /** @dev When fee grant transaction process "MUST" check
     * _latestTransactions[grantee][program] + grant.period < periodReset(grantee, program)
     * if true reset 'spendPeriod' to 'periodLimit' otherwise 'spendPeriod' subtract by 'upfrontGasCost'
     */
    function periodCanSpend(address grantee, address program) external view returns (uint256) {
        if (_grants[grantee][address(0)].allowance == FEE_ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
            program = address(0);
        }
        if (_grants[grantee][program].allowance == FEE_ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
            Grant memory grant = _grants[grantee][program];
            if (grant.latestTransaction + grant.period < this.periodReset(grantee, program)) {
                return grant.periodLimit;
            } else {
                return grant.periodCanSpend;
            }
        } else {
            return 0;
        }
    }

    function periodReset(address grantee, address program) external view returns (uint256) {
        if (_grants[grantee][address(0)].allowance == FEE_ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
            program = address(0);
        }
        if (_grants[grantee][program].allowance == FEE_ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
            uint256 resetBlock = _grants[grantee][program].startTime;
            uint256 period = _grants[grantee][program].period;

            uint256 cycles = (block.number - resetBlock) / period;
            if (cycles != 0) {
                resetBlock += cycles * period;
            }
            return resetBlock + period;
        } else {
            return 0;
        }
    }

    function isExpired(address grantee, address program) external view returns (bool) {
        if (_isGranted(grantee, program)) {
            uint256 endTime = _grants[grantee][program].endTime;
            if (endTime == 0) {
                return false;
            } else {
                return block.number >= endTime;
            }
        } else {
            return true;
        }
    }

    function grant(address grantee, address program) external view returns (Grant memory) {
        Grant memory grant = _grants[grantee][program];
        grant.periodCanSpend = this.periodCanSpend(grantee, program);
        return grant;
    }

    function isGrantedForProgram(address grantee, address program) external view returns (bool) {
        return _isGranteds[grantee][program];
    }

    function isGrantedForAllProgram(address grantee) external view returns (bool) {
        return _isGranteds[grantee][address(0)];
    }

    /** helpers */
    function manipulateStartTime(address grantee, address program, uint256 blockNumber) external {
        _grants[grantee][program].startTime = blockNumber;
    }

    function manipulateEndTime(address grantee, address program, uint256 blockNumber) external {
        _grants[grantee][program].endTime = blockNumber;
    }

    function manipulateLatestTransaction(address grantee, address program, uint256 blockNumber) external {
        _grants[grantee][program].latestTransaction = blockNumber;
    }

    function manipulateSpendPeriod(address grantee, address program, uint256 value) external {
        _grants[grantee][program].periodCanSpend = value;
    }
}
