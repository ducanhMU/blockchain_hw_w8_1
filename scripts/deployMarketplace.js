async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy NFT Contract
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy();  // Returns a deployment transaction
    await myNFT.waitForDeployment();  // Wait for deployment to complete (Ethers.js v6+)
    console.log("NFT Contract deployed to:", await myNFT.getAddress());

    // Deploy Marketplace Contract
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();
    console.log("Marketplace Contract deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
