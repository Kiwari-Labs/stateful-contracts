// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {expect} from "chai";
import {hardhat_reset, initMockStatefulPrecompiledContract, mockDeployer} from "./utils.test";
import {ethers} from "hardhat";
import {formatEther, parseEther, ZeroAddress, zeroPadBytes} from "ethers";

describe("NativeMinter", async function () {
  const contractName: string = "MockNativeMinter";
  const nativeTokenAmount: bigint = parseEther("1");

  beforeEach(async function () {
    await initMockStatefulPrecompiledContract();
  });

  afterEach(async function () {
    await hardhat_reset();
  });

  /** SUCCESSFUL */
  it("Mint", async function () {
    const {contract, deployer, alice} = await mockDeployer(contractName);
    expect(await contract.connect(deployer).mint(alice.address, nativeTokenAmount))
      .to.emit(contract, "Minted")
      .withArgs(alice.address, nativeTokenAmount);
    expect(formatEther(await ethers.provider.getBalance(alice.address))).to.equals("10001.0");
  });

  /** REVERT */
  it("Mint with zero value", async function () {
    const {contract, deployer, alice} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).mint(alice.address, 0))
      .to.be.revertedWithCustomError(contract, "NativeMinterInvalidValue")
      .withArgs(0);
  });

  it("Mint with zero address", async function () {
    const {contract, deployer} = await mockDeployer(contractName);
    await expect(contract.connect(deployer).mint(ZeroAddress, nativeTokenAmount))
      .to.be.revertedWithCustomError(contract, "NativeMinterInvalidAddress")
      .withArgs(ZeroAddress);
  });
});
