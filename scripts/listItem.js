async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Replace with your contract addresses
    const marketplaceAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    const myNFTAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

    // Get contract instances
    const MyNFT = await ethers.getContractAt("MyNFT", myNFTAddress);
    const Marketplace = await ethers.getContractAt("Marketplace", marketplaceAddress);

    // Try specific tokenId first (change if you know your NFT uses different starting ID)
    const startingTokenId = 0;
    const maxAttempts = 20; // Check up to tokenId 19

    let listed = false;

    // Check ownership and list
    for (let tokenId = startingTokenId; tokenId < maxAttempts; tokenId++) {
        try {
            const owner = await MyNFT.ownerOf(tokenId);
            if (owner.toLowerCase() === deployer.address.toLowerCase()) {
                console.log(`Found NFT owned by deployer - TokenID: ${tokenId}`);

                // Approve Marketplace
                console.log("Approving Marketplace...");
                await (await MyNFT.approve(marketplaceAddress, tokenId)).wait();

                // List the NFT
                const price = ethers.parseEther("0.1");
                console.log("Listing NFT...");
                await (await Marketplace.listItem(myNFTAddress, tokenId, price)).wait();

                console.log(`✅ Successfully listed TokenID ${tokenId} for 0.1 ETH`);
                listed = true;
                break;
            }
        } catch (error) {
            if (!error.message.includes('ERC721NonexistentToken')) {
                console.error(`Error checking TokenID ${tokenId}:`, error.message);
            }
            continue;
        }
    }

    if (!listed) {
        console.error("No owned NFTs found in the searched range");
        console.log("Possible solutions:");
        console.log("1. Mint a new NFT first");
        console.log("2. Check your contract's tokenId system (they might start at 1)");
        console.log(`3. Increase maxAttempts (currently set to ${maxAttempts})`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
