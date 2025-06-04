// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {expect} from "chai";
import {hardhat_reset, mockDeployer, initMockStatefulPrecompiledContract} from "./utils.test";
import {ZeroAddress} from "ethers";

describe("AddressRegistry", async function () {
  const contractName: string = "MockAddressRegistry";

  beforeEach(async function () {
    await initMockStatefulPrecompiledContract();
  });

  afterEach(async function () {
    await hardhat_reset();
  });

  /** SUCCESSFUL */
  it("AddToRegistry", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).addToRegistry(alice.address, bob.address))
      .to.emit(contract, "AddedToRegistry")
      .withArgs(alice.address, bob.address);
    expect(await contract.contains(alice.address)).to.equals(true);
    expect(await contract.discovery(alice.address)).to.equals(bob.address);
  });

  it("RemoveFromRegistry", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).addToRegistry(alice.address, bob.address);
    await expect(contract.connect(deployer).removeFromRegistry(alice.address, bob.address))
      .to.emit(contract, "RemovedFromRegistry")
      .withArgs(alice.address, bob.address);
    expect(await contract.contains(alice.address)).to.equals(false);
    expect(await contract.discovery(alice.address)).to.equals(ZeroAddress);
  });

  /** REVERT */
  it("AddToRegistry with zero address", async function () {
    const {contract, deployer, alice} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).addToRegistry(ZeroAddress, alice.address))
      .to.be.revertedWithCustomError(contract, "AddressRegistryInvalidAddress")
      .withArgs(ZeroAddress);
  });

  it("AddToRegistry with exists address", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).addToRegistry(alice.address, bob.address);
    expect(await contract.contains(alice.address)).to.equals(true);
    await expect(contract.connect(deployer).addToRegistry(alice.address, bob.address))
      .to.be.revertedWithCustomError(contract, "AddressRegistryAddressExists")
      .withArgs(alice.address);
  });

  it("RemoveFromRegistry with not exists address", async function () {
    const {contract, deployer, alice} = await mockDeployer(contractName);
    expect(await contract.contains(alice.address)).to.equals(false);
    await expect(contract.connect(deployer).removeFromRegistry(ZeroAddress, alice.address))
      .to.be.revertedWithCustomError(contract, "AddressRegistryAddressNotExists")
      .withArgs(ZeroAddress);
  });

  it("RemoveFromRegistry with not match initiator", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).addToRegistry(alice.address, bob.address);
    expect(await contract.contains(alice.address)).to.equals(true);
    expect(await contract.discovery(alice.address)).to.equals(bob.address);
    await expect(contract.connect(deployer).removeFromRegistry(alice.address, alice.address))
      .to.be.revertedWithCustomError(contract, "AddressRegistryInvalidInitiator")
      .withArgs(bob.address, alice.address);
  });
});
