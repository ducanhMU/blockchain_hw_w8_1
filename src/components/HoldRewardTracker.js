import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function HoldRewardTracker({ tokenContract, userAddress }) {
  const [holdings, setHoldings] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const balance = await tokenContract.balanceOf(userAddress);
      const holderInfo = await tokenContract.holders(userAddress);
      
      setHoldings(ethers.utils.formatEther(balance));
      setPendingRewards(ethers.utils.formatEther(
        await tokenContract.calculateReward(userAddress)
      ));
      setLastUpdate(new Date(holderInfo.lastUpdate * 1000).toLocaleString());
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [tokenContract, userAddress]);

  const claimRewards = async () => {
    const tx = await tokenContract.transfer(userAddress, 0); // Trigger _beforeTokenTransfer
    await tx.wait();
    // Data will auto-update from the interval
  };

  return (
    <div className="hold-rewards">
      <h3>Hold-to-Earn Rewards</h3>
      <p>Current Holdings: {holdings} TOKEN</p>
      <p>Pending Rewards: {pendingRewards} TOKEN</p>
      <p>Last Updated: {lastUpdate}</p>
      <button onClick={claimRewards} className="claim-button">
        Claim Rewards (Transfer to self)
      </button>
    </div>
  );
}
