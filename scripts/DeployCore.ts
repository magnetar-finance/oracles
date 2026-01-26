import { network } from 'hardhat';
import Values from './constants/values.json';
import { deploy } from './helpers';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Oracle, MagnetarV2PriceSource, MagnetarV3PriceSource } from '../artifacts/types';

interface CoreOutput {
  oracle: string;
  priceSources: string[];
}

async function main() {
  // Network ID
  const networkId = network.config.chainId as number;
  // Constants
  const CONSTANTS = Values[networkId as unknown as keyof typeof Values];
  // Deploy V2 price source
  const v2PriceSource = await deploy<MagnetarV2PriceSource>(
    'MagnetarV2PriceSource',
    undefined,
    CONSTANTS.v2Factory,
    CONSTANTS.USDT,
    CONSTANTS.USDC,
    CONSTANTS.WETH,
  );
  // Deploy CL price source
  const clPriceSource = await deploy<MagnetarV3PriceSource>(
    'MagnetarV3PriceSource',
    undefined,
    CONSTANTS.clFactory,
    CONSTANTS.USDT,
    CONSTANTS.USDC,
    CONSTANTS.WETH,
  );
  // Compiled price sources
  const priceSources = [v2PriceSource.address, clPriceSource.address];
  // Deploy oracle
  const oracle = await deploy<Oracle>('Oracle', undefined, priceSources);
  const output: CoreOutput = {
    oracle: oracle.address,
    priceSources,
  };

  const outputDirectory = 'scripts/constants/output';
  const outputFile = join(process.cwd(), outputDirectory, `CoreOutput-${String(networkId)}.json`);

  if (!existsSync(outputDirectory)) {
    mkdirSync(outputDirectory);
  }

  try {
    if (!existsSync(outputFile)) {
      const ws = createWriteStream(outputFile);
      ws.write(JSON.stringify(output, null, 2));
      ws.end();
    } else {
      await writeFile(outputFile, JSON.stringify(output, null, 2));
    }
  } catch (err) {
    console.error(`Error writing output file: ${err}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
