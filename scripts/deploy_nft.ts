import hre, { ethers } from "hardhat";
import "@nomiclabs/hardhat-etherscan";
import chalk from "chalk";
import fs from "fs";
import { Contract } from "ethers";
import ProgressBar from "progress";

interface DeploymentObject {
  name: string;
  address: string;
  args: any;
  contract: Contract;
}

// custom `deploy` in order to make verifying easier
const deploy = async (contractName: string, _args: any[] = [], overrides = {}, libraries = {}) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs: any = _args || [];
  const stringifiedArgs = JSON.stringify(contractArgs);
  const contractArtifacts = await ethers.getContractFactory(contractName,{libraries: libraries});
  const contract = await contractArtifacts.deploy(...contractArgs, overrides);
  const contractAddress = contract.address;
  fs.writeFileSync(`artifacts/${contractName}.address`, contractAddress);
  fs.writeFileSync(`artifacts/${contractName}.args`, stringifiedArgs);

  // tslint:disable-next-line: no-console
  console.log("Deploying", chalk.cyan(contractName), "contract to", chalk.magenta(contractAddress));

  await contract.deployed();

  const deployed: DeploymentObject = { name: contractName, address: contractAddress, args: contractArgs, contract };

  return deployed
}

const pause = (time: number) => new Promise(resolve => setTimeout(resolve, time));

const verifiableNetwork = ["mainnet", "rinkeby", "goerli"];

async function main() {
  const network = process.env.HARDHAT_NETWORK === undefined ? "localhost" : process.env.HARDHAT_NETWORK;
  
  // tslint:disable-next-line: no-console
  console.log("🚀 Deploying to", chalk.magenta(network), "!");
  if(
    network === "localhost" || 
    network === "hardhat"
  ) {
    const [deployer] = await ethers.getSigners();

    // tslint:disable-next-line: no-console
    console.log(
      chalk.cyan("deploying contracts with the account:"),
      chalk.green(deployer.address)
    );

    // tslint:disable-next-line: no-console
    console.log("Account balance:", (await deployer.getBalance()).toString());
  }

  let contracts: DeploymentObject[] = [];

  const bookcoin =  await deploy("BookCoinNFT", [
    "https://bookcoin.mypinata.cloud/ipfs/Qmda3rPQkCpXfW5UF3FbhWi6o3WpDvnCEm3D37tKC2KtCc/", 
    "https://bookcoin.mypinata.cloud/ipfs/QmXA4y9eiqU7TkdZfZ4VerMhmQ8P4EQpETVdqhToG6BoFp", 
    "The Subtle Art of Not Giving A F*ck", 
    "0x2cCf5f811c38ac96EAF436Fc01BE7f0eBeC7E7c5",
    "0x2cCf5f811c38ac96EAF436Fc01BE7f0eBeC7E7c5",
    10
  ]);
  contracts.push(bookcoin);
  console.log("Finished Deploying.");
  console.log(bookcoin)

  // verification
  if(
    verifiableNetwork.includes(network)
    ) {
      let counter = 0;
      
      // tslint:disable-next-line: no-console
      console.log("Beginning Etherscan verification process...\n", 
        chalk.yellow(`WARNING: The process will wait two minutes for Etherscan 
        to update their backend before commencing, please wait and do not stop 
        the terminal process...`)
      );

      const bar = new ProgressBar('Etherscan update: [:bar] :percent :etas', { 
        total: 100,
        complete: '\u2588',
        incomplete: '\u2591',
      });

      // two minute timeout to let Etherscan update
      const timer = setInterval(() => {
        bar.tick();
        if(bar.complete) {
          clearInterval(timer);
        }
      }, 1000);

      await pause(120000);

      // tslint:disable-next-line: no-console
      console.log(chalk.cyan("\n🔍 Running Etherscan verification..."));
      
      await Promise.all(contracts.map(async contract => {
        // tslint:disable-next-line: no-console
        console.log(`Verifying ${contract.name}...`);
        try {
          await hre.run("verify:verify", {
            address: contract.address,
            constructorArguments: contract.args
          });
          // tslint:disable-next-line: no-console
          console.log(chalk.cyan(`✅ ${contract.name} verified!`));
        } catch (error) {
          // tslint:disable-next-line: no-console
          console.log(error);
        }
      }));
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    // tslint:disable-next-line: no-console
    console.error(error);
    process.exit(1);
  });