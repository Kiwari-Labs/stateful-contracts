// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Interface for Interacting with Stateful Precompiled Contract
 * @author Kiwari Labs
 * @notice This contract use for test with Remix IDE purpose only by load interface `At Address`.
 */

interface IOwnable {
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external returns (bool);
    function initialized() external view returns (bool);
    function initializeOwner(address owner) external returns (bool);
}

interface INativeMinter {
    function mint(address to, uint256 value) external returns (bool);
}

interface IGasPrice {
    function gasPrice() external view returns (uint256);
    function status() external view returns (bool);
    function enable() external returns (bool);
    function disable() external returns (bool);
    function setGasPrice(uint256 price) external returns (bool);
}

interface IAddressRegistry {
    function contains(address account) external view returns (bool);
    function discovery(address account) external view returns (address);
    function addToRegistry(address account, address initiator) external returns (bool);
    function removeFromRegistry(address account, address initiator) external returns (bool);
}

interface IRevenueRatio {
    function status() external view returns (bool);
    function enable() external returns (bool);
    function disable() external returns (bool);
    function contractRatio() external view returns (uint256);
    function coinbaseRatio() external view returns (uint256);
    function providerRatio() external view returns (uint256);
    function treasuryRatio() external view returns (uint256);
    function setRevenueRatio(uint8 contractRatio, uint8 coinbaseRatio, uint8 providerRatio, uint8 treasuryRatio) external returns (bool);
}

interface ITreasuryRegistry {
    function treasuryAt() external view returns (address);
    function setTreasury(address newTreasury) external returns (bool);
}

interface IGasFeeGrant {
    enum FEE_ALLOWANCE_TYPE {
        NON_ALLOWANCE,
        BASIC_ALLOWANCE,
        PERIODIC_ALLOWANCE
    }

    struct Grant {
        address granter;
        FEE_ALLOWANCE_TYPE allowance;
        uint256 spendLimit;
        uint256 periodLimit;
        uint256 periodCanSpend;
        uint256 startTime;
        uint256 endTime;
        uint256 latestTransaction;
        uint32 period;
    }
    
    function setFeeGrant(
        address granter,
        address grantee,
        address program,
        uint256 spendLimit,
        uint32 period,
        uint256 periodLimit,
        uint256 endTime
    ) external returns (bool);
    function revokeFeeGrant(address grantee, address program) external returns (bool);
    function periodCanSpend(address grantee, address program) external view returns (uint256);
    function periodReset(address grantee, address program) external view returns (uint256);
    function isExpired(address grantee, address program) external view returns (bool);
    function isGrantedForProgram(address grantee, address program) external view returns (bool);
    function isGrantedForAllProgram(address grantee) external view returns (bool);
    function grant(address grantee, address program) external view returns (Grant memory);
}

