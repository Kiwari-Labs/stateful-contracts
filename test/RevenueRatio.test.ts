// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {expect} from "chai";
import {hardhat_reset, initMockStatefulPrecompiledContract, mockDeployer} from "./utils.test";

describe("RevenueRatio", async function () {
  const contractName = "MockRevenueRatio";
  const contractRatio = 25;
  const coinbaseRatio = 25;
  const providerRatio = 25;
  const treasuryRatio = 25;

  beforeEach(async function () {
    await initMockStatefulPrecompiledContract();
  });

  afterEach(async function () {
    await hardhat_reset();
  });

  /** SUCCESSFUL */
  it("Enabling", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).enable()).to.emit(contract, "RevenueRatioEnabled");
    expect(await contract.status()).to.equal(true);
  });

  it("Disabling", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await contract.connect(deployer).enable();
    await expect(contract.connect(deployer).disable()).to.emit(contract, "RevenueRatioDisabled");
    expect(await contract.status()).to.equal(false);
  });

  it("SetRevenueRatio", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    expect(await contract.contractRatio()).to.equal(0);
    expect(await contract.coinbaseRatio()).to.equal(0);
    expect(await contract.providerRatio()).to.equal(0);
    expect(await contract.treasuryRatio()).to.equal(0);
    await expect(contract.connect(deployer).setRevenueRatio(contractRatio, coinbaseRatio, providerRatio, treasuryRatio))
      .to.emit(contract, "RevenueRatioUpdated")
      .withArgs(contractRatio, coinbaseRatio, providerRatio, treasuryRatio);
    expect(await contract.contractRatio()).to.equal(contractRatio);
    expect(await contract.coinbaseRatio()).to.equal(coinbaseRatio);
    expect(await contract.providerRatio()).to.equal(providerRatio);
    expect(await contract.treasuryRatio()).to.equal(treasuryRatio);
  });

  /** REVERT */
  it("Enabling on status true", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await contract.connect(deployer).enable();
    await expect(contract.connect(deployer).enable()).to.be.revertedWithCustomError(contract, "RevenueRatioStatusEnable");
  });

  it("Disable on status false", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).disable()).to.be.revertedWithCustomError(contract, "RevenueRatioStatusDisable");
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

  it("SetRevenueRatio less than threshold", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).setRevenueRatio(0, 0, 0, 0))
      .to.be.revertedWithCustomError(contract, "RevenueRatioInvalid")
      .withArgs(0, 100);
  });

  it("SetRevenueRatio greater than threshold", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).setRevenueRatio(100, 1, 0, 0))
      .to.be.revertedWithCustomError(contract, "RevenueRatioInvalid")
      .withArgs(101, 100);
  });
});
