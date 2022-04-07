import { ethers, waffle } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { expect } from "chai";
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { Console } from "console";
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
let userAddr1: String, userAddr2: String, userAddr3: String, userAddr4: String, userAddr5: String, userAddr6: String, userAddr7: String, userAddr8: String, userAddr9: String, userAddr10: String;
let userAddr11: String, userAddr12: String, userAddr13: String, userAddr14: String, userAddr15: String, userAddr16: String, userAddr17: String, userAddr18: String, userAddr19: String;

let bookcoin721: Contract;

let rootPreSale: MerkleTree;
let rootGroup1: MerkleTree;
let rootGroup2: MerkleTree;
let addressArray: String[];


describe('BookCoin721', () => {
    beforeEach(async function () {

              

    });

    describe("Mint Functions", () => {
        beforeEach(async () => {
            
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
            rootGroup1 = new MerkleTree(addressArray.slice(0, 8).map(address => hashToken(address)), keccak256, { sortPairs: true });
            rootGroup2 = new MerkleTree(addressArray.slice(0, 20).map(address => hashToken(address)), keccak256, { sortPairs: true }); 
            let BookCoin721 = await ethers.getContractFactory("BookCoin721");
            bookcoin721 = await BookCoin721.connect(owner).deploy(
                "BookCoin Metalibrary Cards",
                "MLC",
                //rootPreSale.getHexRoot(), 
                //rootGroup1.getHexRoot(), 
                rootGroup2.getHexRoot());
            await bookcoin721.deployed();
        });

        it("Mint All", async () => {
            console.log("Length of accounts: " + accounts.length);
            for (const account of accounts){
                let addr = await account.getAddress();
                console.log("Minting for " + addr);
                const proof = rootGroup2.getHexProof(hashToken(addr));
                /**
                 * mints token using merkle proof (anyone with the proof)
                 */
                const tokenID = await bookcoin721.getNextTokenId();
                expect (await bookcoin721.connect(account).canMint(addr, proof)).to.be.true;
                await expect(bookcoin721.connect(account).mint(proof, {
                    value: ethers.utils.parseEther("0.1")
                }))
                    .to.emit(bookcoin721, 'Transfer')
                    .withArgs(ethers.constants.AddressZero, addr, tokenID);
            }
        });
    });
});
