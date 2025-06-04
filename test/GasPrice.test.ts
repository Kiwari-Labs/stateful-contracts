// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {expect} from "chai";
import {hardhat_reset, mockDeployer, initMockStatefulPrecompiledContract} from "./utils.test";

describe("GasPrice", async function () {
  const contractName: string = "MockGasPrice";
  const gasPrice = 1000;

  beforeEach(async function () {
    await initMockStatefulPrecompiledContract();
  });

  afterEach(async function () {
    await hardhat_reset();
  });

  it("GasPrice", async function () {
    const {contract} = await mockDeployer(contractName);
    expect(await contract.gasPrice()).to.equal(0);
  });

  /** SUCCESSFUL */
  it("Enabling", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).enable()).to.emit(contract, "GasPriceEnabled");
    expect(await contract.status()).to.equal(true);
  });

  it("Disabling", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await contract.connect(deployer).enable();
    await expect(contract.connect(deployer).disable()).to.emit(contract, "GasPriceDisabled");
    expect(await contract.status()).to.equal(false);
  });

  it("SetGasPrice", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).setGasPrice(gasPrice)).to.emit(contract, "GasPriceUpdated").withArgs(0, gasPrice);
    expect(await contract.gasPrice()).to.equal(gasPrice);
  });

  /** REVERT */
  it("Enabling on status true", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await contract.connect(deployer).enable();
    await expect(contract.connect(deployer).enable()).to.be.revertedWithCustomError(contract, "GasPriceStatusEnable");
  });

  it("Disable on status false", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).disable()).to.be.revertedWithCustomError(contract, "GasPriceStatusDisable");
  });

  it("Enabling/Disabling with unauthorized account", async function () {
    const {contract, alice} = await mockDeployer(contractName);
    await expect(contract.connect(alice).enable())
      .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
    await expect(contract.connect(alice).disable())
      .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });

  it("SetGasPrice with unauthorized account", async function () {
    const {contract, alice} = await mockDeployer(contractName);
    await expect(contract.connect(alice).setGasPrice(0))
      .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });
});
