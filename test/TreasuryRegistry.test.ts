// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {expect} from "chai";
import {hardhat_reset, initMockStatefulPrecompiledContract, mockDeployer} from "./utils.test";
import {ZeroAddress} from "ethers";

describe("TreasuryRegistry", async function () {
  const contractName: string = "MockTreasuryRegistry";

  beforeEach(async function () {
    await initMockStatefulPrecompiledContract();
  });

  afterEach(async function () {
    await hardhat_reset();
  });

  /** SUCCESSFUL */
  it("SetTreasury", async function () {
    const {contract, deployer, alice} = await mockDeployer(contractName);
    expect(await contract.treasuryAt()).to.equal(ZeroAddress);
    await expect(contract.connect(deployer).setTreasury(alice.address))
      .to.emit(contract, "TreasuryUpdated")
      .withArgs(ZeroAddress, alice.address);
    expect(await contract.treasuryAt()).to.equals(alice.address);
  });

  /** REVERT */
  it("SetTreasury with unauthorized account", async function () {
    const {contract, alice} = await mockDeployer(contractName);
    await expect(contract.connect(alice).setTreasury(alice.address))
      .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });

  it("SetTreasury with zero address", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).setTreasury(ZeroAddress))
      .to.be.revertedWithCustomError(contract, "TreasuryInvalidAddress")
      .withArgs(ZeroAddress);
  });
});
