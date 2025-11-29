const { json } = require("hardhat/internal/core/params/argumentTypes");

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("hardhat-abi-exporter");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {//启用优化器降低Gas
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // 本地开发网络配置 hardhat node
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // 测试网络配置
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  // Etherscan验证配置
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  },
  // gas reporter
  // gasReporter:{
  //   enabled:true,
  //   // currency:,
  //   outputFile:"",
  //   noColors:false
  // },

  // abi export
  // abiExporter:{
  //   path:"./abi",
  //   runOnCompile:true,
  //   clear:true,
  //   only:[],
  //   spacing:2,
  //   format:"json"
  // },
  // coverage:{
  //   excludeContracts:["Migrations"],
  //   skipFiles:["mocks/","test/"],
  //   measureStatementCoverage:true,
  //   measureFunctionCoverage:true,
  //   measureBranchCoverage:true
  // }
};
