import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import StakePanel from './components/StakePanel';
import HoldRewardTracker from './components/HoldRewardTracker';
import RebaseInfo from './components/RebaseInfo';
import TokenArtifact from './contracts/Token.json';
import contractAddress from './contracts/contract-address.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [tokenType, setTokenType] = useState('staking'); // 'staking', 'hold', or 'rebase'

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        
        const signer = provider.getSigner();
        setSigner(signer);
        
        const contract = new ethers.Contract(
          contractAddress.Token,
          TokenArtifact.abi,
          signer
        );
        setTokenContract(contract);
      }
    };
    
    init();
    
    window.ethereum.on('accountsChanged', (accounts) => {
      setUserAddress(accounts[0] || '');
    });
  }, []);

  if (!provider) return <div>Connect your wallet to continue</div>;

  return (
    <div className="App">
      <header>
        <h1>Token Growth Dashboard</h1>
        <div className="wallet-info">
          Connected: {userAddress.substring(0, 6)}...{userAddress.substring(38)}
        </div>
        
        <div className="token-selector">
          <button onClick={() => setTokenType('staking')}>Staking Token</button>
          <button onClick={() => setTokenType('hold')}>Hold-to-Earn</button>
          <button onClick={() => setTokenType('rebase')}>Auto-Rebase</button>
        </div>
      </header>
      
      <main>
        {tokenType === 'staking' && tokenContract && (
          <StakePanel tokenContract={tokenContract} signer={signer} />
        )}
        
        {tokenType === 'hold' && tokenContract && (
          <HoldRewardTracker tokenContract={tokenContract} userAddress={userAddress} />
        )}
        
        {tokenType === 'rebase' && tokenContract && (
          <RebaseInfo tokenContract={tokenContract} userAddress={userAddress} />
        )}
      </main>
    </div>
  );
}

export default App;
