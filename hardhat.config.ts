import '@typechain/hardhat';
import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    monadTestnet: {
      url: 'https://testnet-rpc.monad.xyz',
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 'auto',
      gas: 'auto',
      gasMultiplier: 1,
    },
    fluentTestnet: {
      url: 'https://rpc.testnet.fluent.xyz/',
      chainId: 20994,
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 'auto',
      gas: 'auto',
      gasMultiplier: 1,
    },
    zenchainTestnet: {
      url: 'https://zenchain-testnet.api.onfinality.io/public',
      chainId: 8408,
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 'auto',
      gas: 'auto',
      gasMultiplier: 1,
    },
    seismicTestnet: {
      url: 'https://gcp-2.seismictest.net/rpc',
      chainId: 5124,
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 'auto',
      gas: 'auto',
      gasMultiplier: 1,
    },
    pharosNetworkTestnet: {
      url: 'https://atlantic.dplabs-internal.com',
      chainId: 688689,
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 'auto',
      gas: 'auto',
      gasMultiplier: 1,
    },
    duskEVMTestnet: {
      url: 'https://rpc.testnet.evm.dusk.network',
      chainId: 745,
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 'auto',
      gas: 'auto',
      gasMultiplier: 1,
    },
  },
  typechain: {
    target: 'ethers-v5',
    outDir: './artifacts/types',
  },
};

export default config;
