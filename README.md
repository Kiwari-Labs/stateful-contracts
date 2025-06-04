# @kiwarilabs/stateful-contracts

A Solidity contracts library for interacting with stateful-precompiled contract.

## Motivation

The `@kiwarilabs/stateful-contracts` library empowers smart contract developers to build customized, adaptive [blockchain](https://github.com/Kiwari-Labs/besu) networks that meet the demands of regulated finance, decentralized infrastructure, and sustainable on-chain economies—all while maintaining Ethereum compatibility.
With stateful-precompiled contracts, developers can achieve dynamic control over blockchain components at `runtime`, without requiring forks or node configuration updates. This unlocks new possibilities for:

- Build a regulated blockchain for payment because you can mint the native token at `runtime`.
- Build a blockchain with a revenue-shared model with `RevenueRatio` precompiled.
- Trusted Network of **Internet of Things** (IoT) or **Decentralized Infrastructure Network** (DePIN) with `AddressRegistry` precompiled.
- Building `AddressRegistry` precompiled as a shared registry for general purposes such as **Know Your Customer** (KYC) or **Blacklist**.
- Write a `gasScheduling` program for adjusting the `gasPrice`.
- Write an `adaptiveGasPrice` mechanism when some states from other contracts meet the condition.
- Write any logic to calculate the `gasPrice` then you set the runtime `gasPrice` via `GasPrice` precompiled.
- Sponsor `gas`, enabling users to transact without fees via `GasFeeGrant` like [cosmos-sdk/feegrant](https://docs.cosmos.network/main/build/modules/feegrant#periodicallowance) module.

## Installing

``` shell
npm install @kiwarilabs/stateful-contracts
```

## Build from source

Clone repository
``` shell
git clone https://github.com/Kiwari-Labs/stateful-contracts
```

Installing dependencies
``` shell
yarn install
```

Building the package locally
``` shell
yarn run pack
```

Installing local build package to your project with `yarn` please see this [document](https://classic.yarnpkg.com/lang/en/docs/cli/add/).

## Example Usage

``` Solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AbstractNativeMinter} from "@kiwarilabs/abstracts/AbstractNativeMinter.sol";
import {AbstractAddressRegistry} from "@kiwarilabs/abstracts/AbstractAddressRegistry.sol";
import {AbstractGasPrice} from "@kiwarilabs/abstracts/AbstractGasPrice.sol";
import {AbstractRevenueRatio} from "@kiwarilabs/abstracts/AbstractRevenueRatio.sol";
import {AbstractTreasuryRegistry} from "@kiwarilabs/abstracts/AbstractTreasuryRegistry.sol";
import {AbstractGasFeeGrant} from "@kiwarilabs/abstracts/AbstractGasFeeGrant.sol";

contract RuntimeControlContract is AbstractNativeMinter, AbstractAddressRegistry, AbstractGasPrice, AbstractRevenueRatio, AbstractTreasuryRegistry, AbstractGasFeeGrant {
    constructor(
        address nativeMinterPrecompiled,
        address addressRegistryPrecompiled,
        address gasPricePrecompiled,
        address revenueRatioPrecompiled,
        address treasuryRegistryPrecompiled,
        address gasFeeGrantPrecompiled,
        address admin
    )
        AbstractNativeMinter(nativeMinterPrecompiled, admin)
        AbstractAddressRegistry(addressRegistryPrecompiled, admin)
        AbstractGasPrice(gasPricePrecompiled, admin)
        AbstractRevenueRatio(revenueRatioPrecompiled, admin)
        AbstractTreasuryRegistry(treasuryRegistryPrecompiled, admin)
        AbstractGasFeeGrant(gasFeeGrantPrecompiled, admin)
    {}

    // Your implementation below, e.g governance vote before action.
}
```

## Start Example Network

Please change the `image` in `docker-compose.yml` to the [`Kiwari-Labs/besu`](https://github.com/Kiwari-Labs/besu) image.

``` bash
cd blockchain
```

For starting the network
``` bash
./scripts/start.sh
```

For stop the network

``` bash
./scripts/stop.sh
```

> [!IMPORTANT]
> If you don't want to use stateful precompiled contracts, you can initial owner with `address(0)` at `genesis.json` or call `initializedOwner` with `address(0)`.

## Stateful Contract Address Registry

- Stateful-precompiled contract imploded [EIP-1352](https://eips.ethereum.org/EIPS/eip-1352) for reserve system contract address.
    | contract                   | address                                      |
    | -------------------------- | -------------------------------------------- |
    | `NativeMinterContract`     | `0x0000000000000000000000000000000000001001` |
    | `AddressRegistryContract`  | `0x0000000000000000000000000000000000001002` |
    | `GasPriceContract`         | `0x0000000000000000000000000000000000001003` |
    | `RevenueRatioContract`     | `0x0000000000000000000000000000000000001004` |
    | `TreasuryRegistryContract` | `0x0000000000000000000000000000000000001005` |
    | `GasFeeGrantContract`      | `0x0000000000000000000000000000000000001006` |
    
## Security Considerations

- Each stateful-precompiled contract adopts the `Ownable` pattern for access control and can be `initializeOwner` only once before usage.
- The `gasUsed` for a precompiled operation in the mock contract differs from the actual precompiled contract, as the actual `gasUsed` depends on its specific implementation.
The `NativeMinter` and `contractRatio` of `RevenueRatio` should be used with caution. If the minting native token or the transaction fee is distributed back to the Liquidity Pool, it may affect the trading pair.
- The `GasFeeGrant` will not function if the `granter`'s balance is insufficient to cover the `grantee`'s transaction fees.  
- The `GasFeeGrant` does not automatically adjust the `gasPrice` of the transaction to match the median `gasPrice`.  
  - If the grantee has a `PERIODIC_ALLOWANCE` and submits a transaction with an excessively high `gasPrice`, it may quickly deplete the allocated fee allowance for that period.  
  - For `BASIC_ALLOWANCE`, avoid setting an excessively high `feeGrantPerTransaction`, as a single transaction could consume the entire granter balance.  
  - In all cases, avoid setting high values for `expiredAt`, `feeGrantPerTransaction`, and `feeGrantPerPeriod` to minimize the risk of stale grants being exploited.  


## Copyright

Copyright 2025 Kiwari Labs Licensed under the [MIT](./LICENSE).
