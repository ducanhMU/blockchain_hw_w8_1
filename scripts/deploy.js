const { ethers } = require("hardhat");

async function main() {
  const [deployer, ...otherAccounts] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Define token parameters
  const initialSupply = ethers.parseUnits("50000000", 18); // 50 million tokens initial supply
  
  // Deploy token contract with fee feature
  const Token = await ethers.getContractFactory("FeeToken");
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);
  
  // Get deployer's initial balance (50 million tokens)
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log(`Deployer balance: ${ethers.formatUnits(deployerBalance, 18)} FEE`);
  
  // Check initial fee balance (should be 0)
  const initialFees = await token.totalFeesCollected();
  console.log(`Initial fees collected: ${ethers.formatUnits(initialFees, 18)} FEE`);

  // Distribute tokens to other accounts if they exist
  if (otherAccounts.length > 0) {
    console.log("\nDistributing tokens to other accounts (with 0.1% fee):");
    
    // Amount to transfer to each account (e.g., 1000 tokens each)
    const transferAmount = ethers.parseUnits("1000", 18);
    
    for (let i = 0; i < otherAccounts.length; i++) {
      const recipientAddress = otherAccounts[i].address;

      // Transfer tokens from deployer to this account (will automatically deduct 0.1% fee)
      const tx = await token.transfer(recipientAddress, transferAmount);
      await tx.wait();

      // Calculate expected received amount (after 0.1% fee)
      const expectedReceived = transferAmount * 999n / 1000n;
      const expectedFee = transferAmount - expectedReceived;

      // Verify the transfer was successful
      const recipientBalance = await token.balanceOf(recipientAddress);
      const ownerBalance = await token.balanceOf(deployer.address);
      const totalFees = await token.totalFeesCollected();
      
      console.log(`Transferred ${ethers.formatUnits(transferAmount, 18)} FEE`);
      console.log(`- Recipient received: ${ethers.formatUnits(recipientBalance, 18)} FEE`);
      console.log(`- Fee charged: ${ethers.formatUnits(expectedFee, 18)} FEE`);
      console.log(`- Owner's new balance: ${ethers.formatUnits(ownerBalance, 18)} FEE`);
      console.log(`- Total fees collected: ${ethers.formatUnits(totalFees, 18)} FEE`);
    }
  }

  // Option to withdraw fees to owner's wallet
  console.log("\nWithdrawing collected fees to owner...");
  const withdrawTx = await token.withdrawFees();
  await withdrawTx.wait();
  
  const finalOwnerBalance = await token.balanceOf(deployer.address);
  console.log(`Owner's final balance: ${ethers.formatUnits(finalOwnerBalance, 18)} FEE`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
