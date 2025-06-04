// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {expect} from "chai";
import {
  hardhat_reset,
  mockDeployer,
  AddressRegistryAddress,
  GasPriceAddress,
  NativeMinterAddress,
  initMockStatefulPrecompiledContract,
  RevenueRatioAddress,
} from "./utils.test";

describe("Ownable", async function () {
  const contractName = ["MockNativeMinter", "MockAddressRegistry", "MockGasPrice", "MockRevenueRatio"];
  const contractAddress = [NativeMinterAddress, AddressRegistryAddress, GasPriceAddress, RevenueRatioAddress];

  beforeEach(async function () {
    await initMockStatefulPrecompiledContract();
  });

  afterEach(async function () {
    await hardhat_reset();
  });

  it("Initialized Owner", async function () {
    for (let index = 0; index < contractName.length; index++) {
      const {contract, deployer} = await mockDeployer(contractName[index]);
      expect(await contract.initialized()).to.equal(true);
      expect(await contract.admin()).to.equal(deployer.address);
      expect(await contract.owner()).to.equal(await contract.getAddress());
    }
  });

  it("Transfer Ownership", async function () {
    for (let index = 0; index < contractName.length; index++) {
      const {contract, deployer, alice} = await mockDeployer(contractName[index]);
      await contract.connect(deployer).transferOwnership(alice.address);
      expect(await contract.initialized()).to.equal(true);
      expect(await contract.admin()).to.equal(deployer.address);
      expect(await contract.owner()).to.equal(alice.address);
    }
  });

  it("Transfer Admin", async function () {
    for (let index = 0; index < contractName.length; index++) {
      const {contract, deployer, alice} = await mockDeployer(contractName[index]);
      await contract.connect(deployer).transferAdmin(alice.address);
      expect(await contract.initialized()).to.equal(true);
      expect(await contract.admin()).to.equal(alice.address);
      expect(await contract.owner()).to.equal(await contract.getAddress());
    }
  });

  it("Precompiled At", async function () {
    for (let index = 0; index < contractName.length; index++) {
      const {contract} = await mockDeployer(contractName[index]);
      expect(await contract.precompiledAt()).to.equal(contractAddress[index]);
    }
  });
});
