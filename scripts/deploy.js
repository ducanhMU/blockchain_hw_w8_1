async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const MyNFT = await ethers.getContractFactory("MyNFT");
    
    // Thêm địa chỉ owner làm tham số (deployer.address)
    const myNFT = await MyNFT.deploy(deployer.address);

    console.log("Contract deployed to:", await myNFT.getAddress());
    console.log("Contract owner:", await myNFT.owner());
}

main().catch(console.error);
