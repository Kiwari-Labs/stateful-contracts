// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {expect} from "chai";
import {hardhat_reset, mockDeployer, initMockStatefulPrecompiledContract} from "./utils.test";
import {AddressLike, ZeroAddress} from "ethers";
import {mine, time} from "@nomicfoundation/hardhat-network-helpers";

describe("GasFeeGrant", async function () {
  const contractName: string = "MockGasFeeGrant";
  const defaultProgram: string = ZeroAddress;
  const spendLimit: bigint = 300_000_000_000n;
  const periodLimit: bigint = 300_000_000_000_000n;
  const period: number = 1000;

  const BASIC_ALLOWANCE: number = 1;
  const PERIODIC_ALLOWANCE: number = 2;

  interface Grant {
    "granter": AddressLike,
    "allowance": number,
    "spendLimit": bigint,
    "periodLimit": bigint,
    "periodCanSpend": bigint,
    "startTime": bigint,
    "endTime": bigint,
    "latestTransaction": bigint,
    "period": bigint
  }

  beforeEach(async function () {
    await initMockStatefulPrecompiledContract();
  });

  afterEach(async function () {
    await hardhat_reset();
  });

  /** SUCCESSFUL */
  it("SetFeeGrant Basic", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).setFeeGrant(alice.address, bob.address, defaultProgram, spendLimit, 0, 0, 0);
    const grant: Grant = await contract.grant(bob.address, defaultProgram);
    expect(grant.allowance).equal(BASIC_ALLOWANCE);
    expect(grant.granter).equal(alice.address);
    expect(grant.spendLimit).equal(spendLimit);
    expect(grant.periodLimit).equal(0);
    // expect(grant.startTime).equal(periodLimit);
    expect(grant.endTime).equal(0);
    expect(grant.period).equal(0);
    expect(await contract.isGrantedForProgram(bob.address, defaultProgram)).equal(true);
    expect(await contract.isGrantedForAllProgram(bob.address)).equal(true);
  });

  it("SetFeeGrant Periodic", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).setFeeGrant(alice.address, bob.address, defaultProgram, spendLimit, period, periodLimit, 0);
    const grant: Grant = await contract.grant(bob.address, defaultProgram);
    expect(grant.allowance).equal(PERIODIC_ALLOWANCE);
    expect(grant.granter).equal(alice.address);
    expect(grant.spendLimit).equal(spendLimit);
    expect(grant.periodLimit).equal(periodLimit);
    // expect(grant.startTime).equal(periodLimit);
    expect(grant.endTime).equal(0);
    expect(grant.period).equal(period);
    expect(await contract.isExpired(bob.address, defaultProgram)).equal(false);
  });

  it("PeriodReset", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).setFeeGrant(alice.address, bob.address, defaultProgram, spendLimit, period, periodLimit, 0);
    expect(await contract.periodReset(bob.address, defaultProgram)).equal(period + 2);
    await mine(1000);
    expect(await contract.periodReset(bob.address, defaultProgram)).equal(period * 2 + 2);
    await mine(1000);
    expect(await contract.periodReset(bob.address, defaultProgram)).equal(period * 3 + 2);
    expect(await contract.isExpired(bob.address, defaultProgram)).equal(false);
  });

  it("periodCanSpend", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).setFeeGrant(alice.address, bob.address, defaultProgram, spendLimit, period, periodLimit, 0);
    let currentBlock = await time.latestBlock();
    await contract.manipulateLatestTransaction(bob.address, defaultProgram, currentBlock);
    await contract.manipulateSpendPeriod(bob.address, defaultProgram, periodLimit - 1n);
    expect(await contract.periodReset(bob.address, defaultProgram)).equal(period + 2);
    let grant: Grant = await contract.grant(bob.address, defaultProgram);
    // period can spend left check.
    await contract.manipulateSpendPeriod(bob.address, defaultProgram, periodLimit - 2n);
    expect(await contract.periodCanSpend(bob.address, defaultProgram)).equal(periodLimit - 2n);
    expect(grant.latestTransaction).equal(currentBlock);

    // skip blocks to reset period.
    await mine(1000);
    expect(await contract.periodReset(bob.address, defaultProgram)).equal(period * 2 + 2);
    expect(await contract.periodCanSpend(bob.address, defaultProgram)).equal(periodLimit);

    // it should be reset after real transaction execution successful.
    currentBlock = await time.latestBlock();
    await contract.manipulateLatestTransaction(bob.address, defaultProgram, currentBlock);
    await mine(period - (currentBlock - period));
    await contract.manipulateSpendPeriod(bob.address, defaultProgram, 1);
    grant = await contract.grant(bob.address, defaultProgram);
    // period reset after manipulate spend period.
    expect(await contract.periodCanSpend(bob.address, defaultProgram)).equal(periodLimit);
    expect(grant.latestTransaction).equal(currentBlock);
  });

  it("RevokeFeeGrant", async function () {
    const {contract, deployer, alice, bob} = await mockDeployer(contractName);
    await contract.connect(deployer).setFeeGrant(alice.address, bob.address, defaultProgram, spendLimit, 0, 0, 0);
    let grant : Grant = await contract.grant(bob.address, defaultProgram);
    expect(grant.allowance).equal(BASIC_ALLOWANCE);
    expect(grant.granter).equal(alice.address);
    expect(grant.spendLimit).equal(spendLimit);
    expect(grant.periodLimit).equal(0);
    // expect(grant.startTime).equal(periodLimit);
    expect(grant.endTime).equal(0);
    expect(grant.period).equal(0);
    expect(await contract.isGrantedForProgram(bob.address, defaultProgram)).equal(true);
    expect(await contract.isGrantedForAllProgram(bob.address)).equal(true);
    await contract.connect(deployer).revokeFeeGrant(bob.address, defaultProgram);
    grant = await contract.grant(bob.address, defaultProgram);
    // expect default program reset to zero.
    expect(grant.allowance).equal(0);
    expect(grant.granter).equal(ZeroAddress);
    expect(grant.spendLimit).equal(0);
    expect(grant.periodLimit).equal(0);
    expect(grant.startTime).equal(0);
    expect(grant.endTime).equal(0);
    expect(grant.period).equal(0);
    expect(await contract.isGrantedForProgram(bob.address, defaultProgram)).equal(false);
    expect(await contract.isGrantedForAllProgram(bob.address)).equal(false);
    expect(await contract.isExpired(bob.address, defaultProgram)).equal(true);
  });

  // it("Allowance", async function () {
    // @TODO
  // });

  /** REVERT */
  // @TODO
});
