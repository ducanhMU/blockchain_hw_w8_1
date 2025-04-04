async function main() {
    const [owner] = await ethers.getSigners();
    const myNFT = await ethers.getContractAt("MyNFT", "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1");

    const metadataCID = "QmYomoYeBSQ4SY68NXrmLhuGRc5u3uchY2gVSTQwsXKE3W";
    const tokenURI = `ipfs://${metadataCID}/metadata.json`;

    // Mint NFT
    const tx = await myNFT.mintNFT(owner.address, tokenURI);
    const receipt = await tx.wait();

    // Cách 1: Lấy tokenId từ sự kiện với chuyển đổi rõ ràng
    const mintEvent = receipt.events?.find(e => e.event === "Minted");
    const tokenId = mintEvent ? BigInt(mintEvent.args.tokenId).toString() : 
                 (await myNFT.tokenIdCounter()).toString();

    // Cách 2: Sử dụng toán tử BigInt rõ ràng
    // const tokenId = mintEvent ? mintEvent.args.tokenId.toString() : 
    //              (BigInt(await myNFT.tokenIdCounter()) - 1n).toString();

    console.log(`✅ Minted NFT #${tokenId}`);
    console.log(`Owner: ${owner.address}`);
    console.log(`Token URI: ${tokenURI}`);
}

main().catch(console.error);
