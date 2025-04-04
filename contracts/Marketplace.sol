// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Marketplace {
    struct Item {
        uint256 tokenId;
        address nftContract;
        address payable seller;
        uint256 price;
        bool isSold;
    }

    uint256 public itemCount;
    mapping(uint256 => Item) public items;

    event ItemListed(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 tokenId,
        address seller,
        uint256 price
    );

    event ItemSold(uint256 indexed itemId, address indexed buyer);

    function listItem(address nftContract, uint256 tokenId, uint256 price) external {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "You are not the owner of this token");
        require(price > 0, "Price should be greater than 0");

        itemCount++;
        items[itemCount] = Item({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: payable(msg.sender),
            price: price,
            isSold: false
        });

        nft.transferFrom(msg.sender, address(this), tokenId); // Transfer the token to marketplace

        emit ItemListed(itemCount, nftContract, tokenId, msg.sender, price);
    }

    function buyItem(uint256 itemId) external payable {
        Item storage item = items[itemId];
        require(itemId > 0 && itemId <= itemCount, "Item does not exist");
        require(msg.value == item.price, "Incorrect price");
        require(!item.isSold, "Item already sold");

        item.isSold = true;
        item.seller.transfer(msg.value); // Transfer ETH to the seller
        IERC721(item.nftContract).transferFrom(address(this), msg.sender, item.tokenId); // Transfer NFT to buyer

        emit ItemSold(itemId, msg.sender);
    }

    function getItem(uint256 itemId) external view returns (Item memory) {
        return items[itemId];
    }
}
