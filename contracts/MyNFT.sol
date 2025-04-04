// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    // Khai báo events bên trong contract
    event Minted(address indexed recipient, uint256 indexed tokenId, string tokenURI);
    event TokenCounterUpdated(uint256 newCounter);

    uint256 public tokenIdCounter;

    constructor(address initialOwner) 
        ERC721("MyNFT", "MNFT") 
        Ownable(initialOwner)
    {
        tokenIdCounter = 0;
    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = tokenIdCounter;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenIdCounter++;
        
        emit Minted(recipient, tokenId, tokenURI);
        emit TokenCounterUpdated(tokenIdCounter);
        
        return tokenId;
    }
}
