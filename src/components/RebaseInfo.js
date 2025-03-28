import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function RebaseInfo({ tokenContract, userAddress }) {
  const [baseBalance, setBaseBalance] = useState('0');
  const [actualBalance, setActualBalance] = useState('0');
  const [nextRebase, setNextRebase] = useState('');
  const [rebaseCountdown, setRebaseCountdown] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const balance = await tokenContract.balanceOf(userAddress);
      const lastRebase = await tokenContract.lastRebase();
      const interval = await tokenContract.rebaseInterval();
      
      setActualBalance(ethers.utils.formatEther(balance));
      
      const nextRebaseTime = new Date((Number(lastRebase) + Number(interval)) * 1000);
      setNextRebase(nextRebaseTime.toLocaleString());
      
      // Update countdown every second
      const updateCountdown = () => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = Number(lastRebase) + Number(interval) - now;
        if (remaining > 0) {
          const hours = Math.floor(remaining / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          setRebaseCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setRebaseCountdown('Rebase pending');
        }
      };
      
      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    };
    
    loadData();
  }, [tokenContract, userAddress]);

  const triggerRebase = async () => {
    const tx = await tokenContract.rebase();
    await tx.wait();
    // Balance will auto-update
  };

  return (
    <div className="rebase-info">
      <h3>Auto-Rebase Token</h3>
      <p>Your Balance: {actualBalance} TOKEN</p>
      <p>Next Rebase: {nextRebase}</p>
      <p>Countdown: {rebaseCountdown}</p>
      
      <button onClick={triggerRebase} className="rebase-button">
        Trigger Rebase
      </button>
      
      <div className="rebase-history">
        <h4>Rebase History</h4>
        {/* Would need to query events here */}
      </div>
    </div>
  );
}
