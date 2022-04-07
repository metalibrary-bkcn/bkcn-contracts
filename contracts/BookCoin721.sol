// SPDX-License-Identifier: MIT

/*     


BBBBBBBBBBBBBBBBB                                     kkkkkkkk                  CCCCCCCCCCCCC                   iiii                   
B::::::::::::::::B                                    k::::::k               CCC::::::::::::C                  i::::i                  
B::::::BBBBBB:::::B                                   k::::::k             CC:::::::::::::::C                   iiii                   
BB:::::B     B:::::B                                  k::::::k            C:::::CCCCCCCC::::C                                          
  B::::B     B:::::B   ooooooooooo      ooooooooooo    k:::::k    kkkkkkkC:::::C       CCCCCC   ooooooooooo   iiiiiiinnnn  nnnnnnnn    
  B::::B     B:::::B oo:::::::::::oo  oo:::::::::::oo  k:::::k   k:::::kC:::::C               oo:::::::::::oo i:::::in:::nn::::::::nn  
  B::::BBBBBB:::::B o:::::::::::::::oo:::::::::::::::o k:::::k  k:::::k C:::::C              o:::::::::::::::o i::::in::::::::::::::nn 
  B:::::::::::::BB  o:::::ooooo:::::oo:::::ooooo:::::o k:::::k k:::::k  C:::::C              o:::::ooooo:::::o i::::inn:::::::::::::::n
  B::::BBBBBB:::::B o::::o     o::::oo::::o     o::::o k::::::k:::::k   C:::::C              o::::o     o::::o i::::i  n:::::nnnn:::::n
  B::::B     B:::::Bo::::o     o::::oo::::o     o::::o k:::::::::::k    C:::::C              o::::o     o::::o i::::i  n::::n    n::::n
  B::::B     B:::::Bo::::o     o::::oo::::o     o::::o k:::::::::::k    C:::::C              o::::o     o::::o i::::i  n::::n    n::::n
  B::::B     B:::::Bo::::o     o::::oo::::o     o::::o k::::::k:::::k    C:::::C       CCCCCCo::::o     o::::o i::::i  n::::n    n::::n
BB:::::BBBBBB::::::Bo:::::ooooo:::::oo:::::ooooo:::::ok::::::k k:::::k    C:::::CCCCCCCC::::Co:::::ooooo:::::oi::::::i n::::n    n::::n
B:::::::::::::::::B o:::::::::::::::oo:::::::::::::::ok::::::k  k:::::k    CC:::::::::::::::Co:::::::::::::::oi::::::i n::::n    n::::n
B::::::::::::::::B   oo:::::::::::oo  oo:::::::::::oo k::::::k   k:::::k     CCC::::::::::::C oo:::::::::::oo i::::::i n::::n    n::::n
BBBBBBBBBBBBBBBBB      ooooooooooo      ooooooooooo   kkkkkkkk    kkkkkkk       CCCCCCCCCCCCC   ooooooooooo   iiiiiiii nnnnnn    nnnnnn


*/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract BookCoin721 is ERC2981, ERC721, Ownable {
    using Counters for Counters.Counter;

    //bytes32 public immutable rootPreSale;
    //bytes32 public immutable rootGroup1;
    bytes32 public rootGroup2;
    Counters.Counter private _nextTokenId;
    string private _baseTokenURI;
    string private _contractUri;
    mapping(address => uint256) public mintNum;
    uint256 public supply = 1111; // TODO: this needs to be 3333, with only 1111 minting at a time
    uint256 public mintPrice = 0.1 ether;
    address royaltyAddr = 0x51AaE7357c8baD10DB3532e9AC597efFA5C3820f;
    uint96 royaltyPercent = 1000; //denominator is 10000, so this is 10%

    constructor(
        string memory name,
        string memory symbol,
        //bytes32 merklerootPreSale,
        //bytes32 merklerootGroup1,
        bytes32 merklerootGroup2
    ) ERC2981() ERC721(name, symbol) Ownable() {
        _setDefaultRoyalty(royaltyAddr, royaltyPercent);
        //rootPreSale = merklerootPreSale;
        //rootGroup1 = merklerootGroup1;
        rootGroup2 = merklerootGroup2;
        _nextTokenId.increment();
    }

    /**
     *   @notice overrides EIP721 and EIP2981 supportsInterface function
     *   @param interfaceId is supplied from anyone/contract calling this function, as defined in ERC 165
     *   @return a boolean saying if this contract supports the interface or not
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     *   @notice function to view total supply
     *   @return uint256 with supply
     */
    function totalSupply() public view returns (uint256) {
        return supply;
    }

    /**
     *   @notice function to get next mint token id
     *   @return uint256 with number of next token id
     */
    function getNextTokenId() public view returns (uint256) {
        return _nextTokenId.current();
    }

    /**
     *   @notice override standard ERC721 base URI
     *   @dev doesn't require access control since it's internal
     *   @return string representing base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     *   @notice sets the baseURI for the ERC721 tokens
     *   @dev requires owner
     *   @param uri is the base URI set for each token
     */
    function setBaseURI(string memory uri) public onlyOwner {
        _baseTokenURI = uri;
    }    

    function setMerkleGroup2(bytes32 merkleRoot) public onlyOwner {
        rootGroup2 = merkleRoot;
    }

    /**
     *   @notice provides collection metadata URI
     *   @return string representing contract metadata URI
     */
    function contractURI() public view returns (string memory) {
            return _contractUri;
    }

    /**
     *   @notice sets the collection metadata URI
     *   @dev requires owner
     *   @param newContractUri is the URI set for the collection metadata
     */
    function setContractURI(string memory newContractUri) public onlyOwner {
        _contractUri = newContractUri;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(
                    abi.encodePacked(
                        baseURI,
                        Strings.toString(tokenId),
                        ".json"
                    )
                )
                : "";
    }

    function canMint(address account, bytes32[] calldata proof)
        public
        view
        returns (bool)
    {
        return _verify(_leaf(account), proof);
    }

    function mint(bytes32[] calldata proof) external payable {
        address account = _msgSender();
        require(msg.value >= mintPrice, "Eth Value lower than mint price");
        require(_verify(_leaf(account), proof), "Invalid merkle proof");
        require(mintNum[account] == 0, "Already Minted");
        _safeMint(account, _nextTokenId.current());
        _nextTokenId.increment();
        mintNum[account]++;
    }

    function _leaf(address account) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    function _verify(bytes32 leaf, bytes32[] memory proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(proof, rootGroup2, leaf);
    }

    function withdrawEther() public onlyOwner {
        payable(_msgSender()).transfer(address(this).balance);
    }
}
