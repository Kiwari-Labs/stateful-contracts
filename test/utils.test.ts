// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {AddressLike, parseEther, toBeHex} from "ethers";
import {setCode} from "@nomicfoundation/hardhat-network-helpers";
import {ethers, network} from "hardhat";
import NativeMinterPrecompiledArtifact from "../artifacts/mocks/statefulprecompiles/MockNativeMinterPrecompiled.sol/MockNativeMinterPrecompiled.json";
import AddressRegistryPrecompiledArtifact from "../artifacts/mocks/statefulprecompiles/MockAddressRegistryPrecompiled.sol/MockAddressRegistryPrecompiled.json";
import GasPricePrecompiledArtifact from "../artifacts/mocks/statefulprecompiles/MockGasPricePrecompiled.sol/MockGasPricePrecompiled.json";
import RevenueRatioPrecompiledArtifact from "../artifacts/mocks/statefulprecompiles/MockRevenueRatioPrecompiled.sol/MockRevenueRatioPrecompiled.json";
import TreasuryRegistryPrecompiledArtifact from "../artifacts/mocks/statefulprecompiles/MockTreasuryRegistryPrecompiled.sol/MockTreasuryRegistryAPrecompiled.json";
import GasFeeGrantPrecompiledInterface from "../artifacts/mocks/statefulprecompiles/MockGasFeeGrantPrecompiled.sol/MockGasFeeGrantPrecompiled.json";

export const NativeMinterAddress = "0x0000000000000000000000000000000000001001";
export const AddressRegistryAddress = "0x0000000000000000000000000000000000001002";
export const GasPriceAddress = "0x0000000000000000000000000000000000001003";
export const RevenueRatioAddress = "0x0000000000000000000000000000000000001004";
export const TreasuryRegistryAddress = "0x0000000000000000000000000000000000001005";
export const GasFeeGrantAddress = "0x0000000000000000000000000000000000001006";

export const hardhat_reset = async function () {
  await network.provider.send("hardhat_reset");
};

export const hardhat_impersonate = async function (address: AddressLike) {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
};

export const hardhat_setBalance = async function (address: AddressLike, wei: string) {
  await network.provider.send("hardhat_setBalance", [address, toBeHex(wei, 32)]);
};

export const hardhat_stopImpersonating = async function (address: AddressLike) {
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [address],
  });
};

export const initMockStatefulPrecompiledContract = async function () {
  await setCode(NativeMinterAddress, NativeMinterPrecompiledArtifact.deployedBytecode);
  await setCode(AddressRegistryAddress, AddressRegistryPrecompiledArtifact.deployedBytecode);
  await setCode(GasPriceAddress, GasPricePrecompiledArtifact.deployedBytecode);
  await setCode(RevenueRatioAddress, RevenueRatioPrecompiledArtifact.deployedBytecode);
  await setCode(TreasuryRegistryAddress, TreasuryRegistryPrecompiledArtifact.deployedBytecode);
  await setCode(GasFeeGrantAddress, GasFeeGrantPrecompiledInterface.deployedBytecode);

  await hardhat_setBalance(NativeMinterAddress, parseEther("10000.0").toString());
};

export const mockDeployer = async function (contractName: string) {
  const [deployer, alice, bob, charlie, dave] = await ethers.getSigners();
  let address;
  if (contractName == "MockNativeMinter") {
    address = NativeMinterAddress;
  } else if (contractName == "MockAddressRegistry") {
    address = AddressRegistryAddress;
  } else if (contractName == "MockGasPrice") {
    address = GasPriceAddress;
  } else if (contractName == "MockRevenueRatio") {
    address = RevenueRatioAddress;
  } else if (contractName == "MockTreasuryRegistry") {
    address = TreasuryRegistryAddress;
  } else if (contractName == "MockGasFeeGrant") {
    address = GasFeeGrantAddress;
  } else {
    throw new Error(`contract: ${contractName} not found`);
  }
  const Contract = await ethers.getContractFactory(contractName, deployer);
  const contract = await Contract.deploy(address, deployer);
  await contract.waitForDeployment();

  return {
    contract,
    deployer,
    alice,
    bob,
    charlie,
    dave,
  };
};
