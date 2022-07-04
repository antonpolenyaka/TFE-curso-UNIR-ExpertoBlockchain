require('babel-register');
require('babel-polyfill');

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
var HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    // Ganche
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    
    // Rinkeby
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/339cdf2d95b34c2ebac1df8058373828')
      },
      network_id: 4,
      gas: 4500000,
      gasprice: 10000000000
    },

    // Binance Smart Chain (BSC) Testnet
    bscTestnet: {
      provider: () => new HDWalletProvider(mnemonic, 'https://data-seed-prebsc-1-s1.binance.org:8545/'),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    // Polygon (Matic) => Mumbai TestNet
    matic : {
      provider: () => new HDWalletProvider(mnemonic, "https://rpc-mumbai.maticvigil.com/v1/ee3e364852aaf485420939feec3aa79fc14957e1"),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: '0.8.15',
      settings: {
        optimizer: {
          enabled: true,
          runs: 0
        }
      }
    }
  }
}
