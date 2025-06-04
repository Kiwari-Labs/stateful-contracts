// Copyright Kiwari Labs 2025. All Rights Reserved.
// Node module: @kiwarilabs/stateful-precompiled-contracts
// This file is licensed under the MIT License.
// License text available at https://opensource.org/license/mit/

import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";

import path from "path";
import glob from "glob";
import {subtask} from "hardhat/config";
import {TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS} from "hardhat/builtin-tasks/task-names";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // default
      },
      evmVersion: "shanghai",
    },
  },
  gasReporter: {
    enabled: true,
  },
  mocha: {
    slow: 50,
  },
};

subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS, async (_, {config}) => {
  const mainContracts = glob.sync(path.join(config.paths.root, "contracts/**/*.sol"));
  const mockContracts = glob.sync(path.join(config.paths.root, "mocks/**/*.sol"));

  return [...mainContracts, ...mockContracts].map(path.normalize);
});

export default config;
