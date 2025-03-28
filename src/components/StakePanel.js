import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import StakeForm from './StakeForm';
import UnstakeForm from './UnstakeForm';
import RewardDisplay from './RewardDisplay';

export default function StakePanel({ tokenContract, signer }) {
  const [stakedAmount, setStakedAmount] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const stakeInfo = await tokenContract.stakes(signer.getAddress());
      setStakedAmount(ethers.utils.formatEther(stakeInfo.amount));
      
      const calculatedRewards = await tokenContract.calculateReward(signer.getAddress());
      setRewards(ethers.utils.formatEther(calculatedRewards));
      
      setIsLoading(false);
    };
    
    loadData();
    
    // Update every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [tokenContract, signer]);

  const refreshData = async () => {
    setIsLoading(true);
    const stakeInfo = await tokenContract.stakes(signer.getAddress());
    setStakedAmount(ethers.utils.formatEther(stakeInfo.amount));
    setIsLoading(false);
  };

  if (isLoading) return <div>Loading staking data...</div>;

  return (
    <div className="staking-panel">
      <h2>Staking Dashboard</h2>
      <div className="stats">
        <p>Staked: {stakedAmount} TOKEN</p>
        <RewardDisplay rewards={rewards} />
      </div>
      
      <div className="actions">
        <StakeForm 
          tokenContract={tokenContract} 
          signer={signer} 
          onStake={refreshData}
        />
        <UnstakeForm 
          tokenContract={tokenContract}
          signer={signer}
          onUnstake={refreshData}
          stakedAmount={stakedAmount}
        />
      </div>
    </div>
  );
}
