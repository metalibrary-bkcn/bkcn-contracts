import { ethers, waffle } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { expect } from "chai";
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import hardhat from "hardhat";

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

async function deploy(name: string, ...params: any[]) {
    const contract = await ethers.getContractFactory(name);
    return await contract.deploy(...params).then(f => f.deployed());
}

function hashToken(account: any) {
    return Buffer.from(ethers.utils.solidityKeccak256(['address'], [account]).slice(2), 'hex');
}




const provider = waffle.provider;

let accounts: Signer[];

let owner: Signer;
let ownerAddr: String;
let user1: Signer, user2: Signer, user3: Signer, user4: Signer, user5: Signer, user6: Signer, user7: Signer, user8: Signer, user9: Signer, user10: Signer;
let user11: Signer, user12: Signer, user13: Signer, user14: Signer, user15: Signer, user16: Signer, user17: Signer, user18: Signer, user19: Signer;
let userAddr1: string, userAddr2: string, userAddr3: string, userAddr4: string, userAddr5: string, userAddr6: string, userAddr7: string, userAddr8: string, userAddr9: string, userAddr10: String;
let userAddr11: string, userAddr12: string, userAddr13: string, userAddr14: string, userAddr15: string, userAddr16: string, userAddr17: string, userAddr18: string, userAddr19: String;

let bookcoin721: Contract;

let rootPreSale: MerkleTree;
let rootGroup1: MerkleTree;
let rootGroup2: MerkleTree;
let addressArray: String[];

let preSaleTime: number;
let groupOneTime: number;
let groupTwoTime: number;
let publicMintTime: number;

async function setUp() {
    accounts = await ethers.getSigners();
    owner = accounts[0]; ownerAddr = await owner.getAddress();
    user1 = accounts[1]; userAddr1 = await user1.getAddress();
    user2 = accounts[2]; userAddr2 = await user2.getAddress();
    user3 = accounts[3]; userAddr3 = await user3.getAddress();
    user4 = accounts[4]; userAddr4 = await user4.getAddress();
    user5 = accounts[5]; userAddr5 = await user5.getAddress();
    user6 = accounts[6]; userAddr6 = await user6.getAddress();
    user7 = accounts[7]; userAddr7 = await user7.getAddress();
    user8 = accounts[8]; userAddr8 = await user8.getAddress();
    user9 = accounts[9]; userAddr9 = await user9.getAddress();
    user10 = accounts[10]; userAddr10 = await user10.getAddress();
    user11 = accounts[11]; userAddr11 = await user11.getAddress();
    user12 = accounts[12]; userAddr12 = await user12.getAddress();
    user13 = accounts[13]; userAddr13 = await user13.getAddress();
    user14 = accounts[14]; userAddr14 = await user14.getAddress();
    user15 = accounts[15]; userAddr15 = await user15.getAddress();
    user16 = accounts[16]; userAddr16 = await user16.getAddress();
    user17 = accounts[17]; userAddr17 = await user17.getAddress();
    user18 = accounts[18]; userAddr18 = await user18.getAddress();
    user19 = accounts[19]; userAddr19 = await user19.getAddress();
    addressArray = [ownerAddr, userAddr1, userAddr2, userAddr3, userAddr4, userAddr5, userAddr6, userAddr7, userAddr8, userAddr9, userAddr10,
        userAddr11, userAddr12, userAddr13, userAddr14, userAddr15, userAddr16, userAddr17, userAddr18, userAddr19];
    rootPreSale = new MerkleTree(addressArray.slice(0, 3).map(address => hashToken(address)), keccak256, { sortPairs: true });
    rootGroup1 = new MerkleTree(addressArray.slice(4, 8).map(address => hashToken(address)), keccak256, { sortPairs: true });
    rootGroup2 = new MerkleTree(addressArray.slice(9, 15).map(address => hashToken(address)), keccak256, { sortPairs: true });
    let BookCoin721 = await ethers.getContractFactory("BookCoin721");
    console.log("Deploying Contract");
    bookcoin721 = await BookCoin721.connect(owner).deploy(
        "BookCoin Metalibrary Cards",
        "MLC",
        rootPreSale.getHexRoot(),
        rootGroup1.getHexRoot(),
        rootGroup2.getHexRoot());
    await bookcoin721.deployed();
}

describe('BookCoin721', () => {
    beforeEach(async function () {

    });

    describe("ERC2981 Function", () => {
        beforeEach(async () => {
            await setUp();
        });

        it("defaults properly set", async () => {
            const latestBlock = await hardhat.ethers.provider.getBlock("latest");
            await bookcoin721.connect(owner).setPreSaleStartTime(latestBlock.timestamp - 40000);

            let proof = rootPreSale.getHexProof(hashToken(userAddr1));
            let tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user1).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr1, tokenID);

            let result = await bookcoin721.connect(owner).royaltyInfo(1, ethers.utils.parseEther("1.0"));
            console.log(result);
            expect("0x51AaE7357c8baD10DB3532e9AC597efFA5C3820f" == result[0]);
            expect(BigNumber.from(1).div(10) == result[1]);
        });

        it("can set default royalty", async () => {
            const latestBlock = await hardhat.ethers.provider.getBlock("latest");
            await bookcoin721.connect(owner).setPreSaleStartTime(latestBlock.timestamp - 40000);

            let proof = rootPreSale.getHexProof(hashToken(userAddr1));
            let tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user1).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr1, tokenID);

            let feeBasis = 500;
            let feeAddress = "0x5bC6a8220Fd1645970B467092896B5f98bc339dC";

            await bookcoin721.connect(owner).setDefaultRoyalty(feeAddress, feeBasis);

            let result = await bookcoin721.connect(owner).royaltyInfo(1, ethers.utils.parseEther("1.0"));
            console.log(result);
            expect(feeAddress == result[0]);
            expect(BigNumber.from(1).div(20) == result[1]);
        });
    });

    describe("Mint Functions", () => {
        beforeEach(async () => {
            await setUp();
        });

        it("owner mints one", async () => {
            await bookcoin721.connect(owner).ownerMint(ownerAddr, 1);
            let balance = await bookcoin721.connect(owner).balanceOf(ownerAddr);
            expect(balance == BigNumber.from(1));
        });

        it("owner mints up to limit", async () => {
            await bookcoin721.connect(owner).ownerMint(ownerAddr, 777);
            let balance = await bookcoin721.connect(owner).balanceOf(ownerAddr);
            expect(balance == BigNumber.from(777));
        });

        it("can't mint beyond limit", async () => {
            await bookcoin721.connect(owner).ownerMint(ownerAddr, 777);

            await expect(bookcoin721.connect(owner).ownerMint(ownerAddr, 1))
                .to.be.revertedWith("Cannot mint beyond supply limit");
        });

        // in this test anyone should be able to mint (all set dates are in the past)
        it("Mint All", async () => {
            let count = 0;
            let proof;
            const latestBlock = await hardhat.ethers.provider.getBlock("latest");
            preSaleTime = latestBlock.timestamp - 40000;
            groupOneTime = latestBlock.timestamp - 30000;
            groupTwoTime = latestBlock.timestamp - 20000;
            publicMintTime = latestBlock.timestamp - 10000;

            await bookcoin721.connect(owner).setPreSaleStartTime(latestBlock.timestamp - 40000);
            await bookcoin721.connect(owner).setGroupOneStartTime(latestBlock.timestamp - 30000);
            await bookcoin721.connect(owner).setGroupTwoStartTime(latestBlock.timestamp - 20000);
            await bookcoin721.connect(owner).setPublicMintStartTime(latestBlock.timestamp - 10000);
            for (const account of accounts) {
                let addr = await account.getAddress();
                //console.log("Minting for " + addr);

                if (count <= 3) { proof = rootPreSale.getHexProof(hashToken(addr)); }
                else if (count <= 8) { proof = rootGroup1.getHexProof(hashToken(addr)); }
                else if (count <= 20) { proof = rootGroup2.getHexProof(hashToken(addr)); }
                proof = rootGroup2.getHexProof(hashToken(addr));
                /**
                 * mints token using merkle proof (anyone with the proof)
                 */
                const tokenID = await bookcoin721.getNextTokenId();
                expect(await bookcoin721.connect(account).canMint(addr, proof)).to.be.true;
                await expect(bookcoin721.connect(account).mint(proof, {
                    value: ethers.utils.parseEther("0.15")
                }))
                    .to.emit(bookcoin721, 'Transfer')
                    .withArgs(ethers.constants.AddressZero, addr, tokenID);

                count++;
            }
        });

        // in this test, no one should be able to mint (all set dates are in the future)
        it("nobody can mint before presale date", async () => {
            let count = 0;
            let proof;
            const latestBlock = await hardhat.ethers.provider.getBlock("latest");

            preSaleTime = latestBlock.timestamp + 10000;
            groupOneTime = latestBlock.timestamp + 20000;
            groupTwoTime = latestBlock.timestamp + 30000;
            publicMintTime = latestBlock.timestamp + 40000;

            await bookcoin721.connect(owner).setPreSaleStartTime(preSaleTime);
            await bookcoin721.connect(owner).setGroupOneStartTime(groupOneTime);
            await bookcoin721.connect(owner).setGroupTwoStartTime(groupTwoTime);
            await bookcoin721.connect(owner).setPublicMintStartTime(publicMintTime);
            for (const account of accounts) {
                let addr = await account.getAddress();
                //console.log("Minting for " + addr);
                if (count <= 3) { proof = rootPreSale.getHexProof(hashToken(addr)); }
                else if (count <= 8) { proof = rootGroup1.getHexProof(hashToken(addr)); }
                else if (count <= 15) { proof = rootGroup2.getHexProof(hashToken(addr)); }
                proof = rootGroup2.getHexProof(hashToken(addr));
                /**
                 * mints token using merkle proof (anyone with the proof)
                 */
                const tokenID = await bookcoin721.getNextTokenId();
                expect(await bookcoin721.connect(account).canMint(addr, proof)).to.be.false;
                await expect(bookcoin721.connect(account).mint(proof, {
                    value: ethers.utils.parseEther("0.15")
                }))
                    .to.be.revertedWith("Invalid merkle proof");
                //console.log("mint failed - check!")
                count++;
            }
        });

        // in this test, everyone should be able to mint, but only after manipulation of time
        it("spaced mints work properly", async () => {
            let proof;
            let tokenID;
            const latestBlock = await hardhat.ethers.provider.getBlock("latest");

            preSaleTime = latestBlock.timestamp + 10000;
            groupOneTime = latestBlock.timestamp + 20000;
            groupTwoTime = latestBlock.timestamp + 30000;
            publicMintTime = latestBlock.timestamp + 40000;

            await bookcoin721.connect(owner).setPreSaleStartTime(preSaleTime);
            await bookcoin721.connect(owner).setGroupOneStartTime(groupOneTime);
            await bookcoin721.connect(owner).setGroupTwoStartTime(groupTwoTime);
            await bookcoin721.connect(owner).setPublicMintStartTime(publicMintTime);

            console.log("Attempting to Mint before presale");
            // check mint fails even for someone on the presale list
            proof = rootPreSale.getHexProof(hashToken(ownerAddr));
            await expect(bookcoin721.connect(owner).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.be.revertedWith("Invalid merkle proof");

            //PRESALE
            // advance time to presale window
            hardhat.ethers.provider.send("evm_setNextBlockTimestamp", [preSaleTime + 1]);
            await hardhat.ethers.provider.send("evm_mine", []);

            console.log("Minting from presale address during presale window");
            // mint from a presale address
            tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(owner).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, ownerAddr, tokenID);

            // mint Batch not ready yet
            proof = rootPreSale.getHexProof(hashToken(userAddr1));
            await expect(bookcoin721.connect(user1).mintBatch(proof, 2, { value: ethers.utils.parseEther("0.3") }))
                .to.be.revertedWith("Attempting to mint past limit");

            console.log("Attempting to mint from group one during presale window");
            // fail to mint from a group one address
            proof = rootGroup1.getHexProof(hashToken(userAddr4));
            await expect(bookcoin721.connect(user4).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.be.revertedWith("Invalid merkle proof");

            // GROUP ONE
            // advance time to group 1 window
            await hardhat.ethers.provider.send("evm_setNextBlockTimestamp", [groupOneTime + 1]);
            await hardhat.ethers.provider.send("evm_mine", []);

            console.log("Minting from group one address during group one window");
            // mint from a group1 address
            tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user4).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr4, tokenID);

            console.log("Minting from presale address during group one window");
            // mint from a presale address
            proof = rootPreSale.getHexProof(hashToken(userAddr1));
            tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user1).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr1, tokenID);

            console.log("Attempting to mint from group two address during group one window");
            // fail to mint from a group two address
            proof = rootGroup2.getHexProof(hashToken(userAddr9));
            await expect(bookcoin721.connect(user9).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.be.revertedWith("Invalid merkle proof");

            // GROUP TWO
            // advance time to group 2 window
            await hardhat.ethers.provider.send("evm_setNextBlockTimestamp", [groupTwoTime + 1]);
            await hardhat.ethers.provider.send("evm_mine", []);

            console.log("Minting from group two address during group two window");
            // mint from a group2 address
            tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user9).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr9, tokenID);

            // mint Batch ready
            proof = rootPreSale.getHexProof(hashToken(userAddr1));
            await bookcoin721.connect(user1).mintBatch(proof, 2, { value: ethers.utils.parseEther("0.3") });
            let balance = await bookcoin721.connect(user1).balanceOf(userAddr1);
            expect(balance == BigNumber.from(2));

            // mint Batch won't go past limit
            proof = rootPreSale.getHexProof(hashToken(userAddr1));
            await expect(bookcoin721.connect(user1).mintBatch(proof, 10, { value: ethers.utils.parseEther("1.5") }))
                .to.be.revertedWith("Attempting to mint past limit");


            console.log("Minting from presale address during group two window");
            // mint from a presale address
            proof = rootPreSale.getHexProof(hashToken(userAddr2));
            tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user2).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr2, tokenID);

            console.log("Minting from group 1 address during group two window");
            // mint from a group 1 address
            proof = rootGroup1.getHexProof(hashToken(userAddr5));
            tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user5).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr5, tokenID);

            console.log("Attempting to mint from a public address during group two window");
            // fail to mint from a public mint address
            proof = rootGroup2.getHexProof(hashToken(userAddr16));
            await expect(bookcoin721.connect(user16).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.be.revertedWith("Invalid merkle proof");

            // PUBLIC MINT
            // advance time to group 2 window
            await hardhat.ethers.provider.send("evm_setNextBlockTimestamp", [publicMintTime + 1]);
            await hardhat.ethers.provider.send("evm_mine", []);

            console.log("Minting from public address during public mint");
            // mint from a public mint address
            tokenID = await bookcoin721.getNextTokenId();
            await expect(bookcoin721.connect(user16).mint(proof, { value: ethers.utils.parseEther("0.15") }))
                .to.emit(bookcoin721, 'Transfer')
                .withArgs(ethers.constants.AddressZero, userAddr16, tokenID);

            console.log("Withdrawing Ether earned during mint")
            let balanceBefore = await provider.getBalance(owner.getAddress());
            console.log("Balance before withdrawal: " + ethers.utils.formatEther(balanceBefore));
            await bookcoin721.connect(owner).withdrawEther();
            let balanceAfter = await provider.getBalance(owner.getAddress());
            console.log("Balance after withdrawal: " + ethers.utils.formatEther(balanceAfter));
            let difference = balanceAfter.sub(balanceBefore);
            console.log("Difference: " + ethers.utils.formatEther(difference));

            expect(await provider.getBalance(bookcoin721.address)).to.equal(BigNumber.from(0));

        });

    });

});
