// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./BookCoinNFT.sol";
import "./IERC1155ChildMintable.sol";

/**
 * @title ChildBoinCoinNFT 
 * BoinCoinNFT (ERC1155PresetMinterPauser) - See OpenZeppelin
 */
contract ChildBoinCoinNFT is BookCoinNFT, IERC1155ChildMintable {
  bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

  constructor(string memory uri, string memory contractUri, string memory collectionName, address owner, address royaltyFeeRecipient,
        uint8 royaltyFee, address childChainManager) BookCoinNFT(uri, contractUri, collectionName, owner, royaltyFeeRecipient, royaltyFee) {
    _setupRole(DEPOSITOR_ROLE, childChainManager);
  }

  /**
    * @notice called when tokens are deposited on root chain
    * @dev Should be callable only by ChildChainManager
    * Should handle deposit by minting the required tokens for user
    * Make sure minting is done only by this function
    * @param user user address for whom deposit is being done
    * @param depositData abi encoded ids array and amounts array and additional data
  */
  function deposit(address user, bytes calldata depositData) public virtual override {
    require(hasRole(DEPOSITOR_ROLE, _msgSender()), "Warcorns: Depositor role required");
    (
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) = abi.decode(depositData, (uint256[], uint256[], bytes));

    require(
        user != address(0),
        "Warcorns: INVALID_DEPOSIT_USER"
    );

    _mintBatch(user, ids, amounts, data);

    emit TransferBatch(_msgSender(), address(0), user, ids, amounts);
  }

  /**
    * @notice called when user wants to withdraw single token back to root chain
    * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
    * @param id id to withdraw
    * @param amount amount to withdraw
    */
  function withdrawSingle(uint256 id, uint256 amount) public virtual override {
      _burn(_msgSender(), id, amount);
  }

  /**
    * @notice called when user wants to batch withdraw tokens back to root chain
    * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
    * @param ids ids to withdraw
    * @param amounts amounts to withdraw
    */
  function withdrawBatch(uint256[] calldata ids, uint256[] calldata amounts) public virtual override {
      _burnBatch(_msgSender(), ids, amounts);
  }
}