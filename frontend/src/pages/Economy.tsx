import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { rewardDistributorABI, brockTokenABI } from '../config/abi';
import { Coins, HandCoins, ArrowRight, Wallet, Vault } from 'lucide-react';
import { formatUnits } from 'viem';

// Replace with deployed addresses on Base Sepolia
const REWARD_DISTRIBUTOR_ADDRESS = '0x0000000000000000000000000000000000000000';
const BROCK_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

export const Economy = () => {
  const { address, isConnected } = useAccount();
  
  // In a real scenario, we'd query an indexer/subgraph for all rounds the user mined in.
  // For UI demonstration, we'll mock claimable rounds.
  const mockClaimableRounds = [
    { id: 12, mp: 5, totalProofs: 100, isClaimed: false },
    { id: 13, mp: 8, totalProofs: 120, isClaimed: false },
    { id: 14, mp: 12, totalProofs: 90, isClaimed: false },
  ];
  
  const totalClaimableBROCK = mockClaimableRounds.reduce((acc, round) => {
    // 80 BROCK distributed per round. (80 * MP) / totalProofs
    return acc + (80 * round.mp) / round.totalProofs;
  }, 0);

  // Read BROCK Token Balance
  const { data: balanceData } = useReadContract({
    address: BROCK_TOKEN_ADDRESS,
    abi: brockTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  
  const balance = balanceData ? Number(formatUnits(balanceData as bigint, 18)).toFixed(2) : '0.00';

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const handleBatchClaim = () => {
    if (!address) return;
    const roundIds = mockClaimableRounds.map(r => BigInt(r.id));
    writeContract({
      address: REWARD_DISTRIBUTOR_ADDRESS,
      abi: rewardDistributorABI,
      functionName: 'batchClaim',
      args: [roundIds],
    });
  };

  if (!isConnected) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
          <Coins size={64} color="var(--text-muted)" style={{ marginBottom: '24px' }} />
          <h2>Connect Your Wallet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You must be connected to view your balances and claim rewards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
          <Coins size={32} color="#f59e0b" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Treasury & Rewards</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Claim your mined $BROCK and manage your economic output.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        {/* Claim Rewards Section */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HandCoins size={20} color="#f59e0b" /> Claimable Rewards
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '32px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', color: '#fcd34d', fontWeight: 600 }}>Total Claimable BaseRock</p>
              <h2 style={{ margin: 0, fontSize: '3rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {totalClaimableBROCK.toFixed(2)} <span style={{ fontSize: '1.5rem', color: '#fbbf24' }}>$BROCK</span>
              </h2>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleBatchClaim}
              disabled={isPending || isConfirming || totalClaimableBROCK === 0}
              style={{ padding: '16px 32px', fontSize: '1.1rem', background: '#f59e0b', color: 'white', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}
            >
              {isPending ? 'Confirming...' : isConfirming ? 'Mining Tx...' : 'Batch Claim All'}
            </button>
          </div>
          
          {isConfirmed && (
            <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: 'var(--radius-sm)', marginBottom: '24px', textAlign: 'center' }}>
              Successfully claimed {totalClaimableBROCK.toFixed(2)} $BROCK!
            </div>
          )}

          <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>Recent Mining Rounds</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Round</th>
                  <th style={{ padding: '12px 16px' }}>Your MP</th>
                  <th style={{ padding: '12px 16px' }}>Total Network MP</th>
                  <th style={{ padding: '12px 16px' }}>Reward Split</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockClaimableRounds.map((round) => {
                  const reward = (80 * round.mp) / round.totalProofs;
                  return (
                    <tr key={round.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>#{round.id}</td>
                      <td style={{ padding: '16px', color: 'var(--accent-secondary)' }}>{round.mp} MP</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{round.totalProofs} MP</td>
                      <td style={{ padding: '16px', fontWeight: 600, color: '#f59e0b' }}>{reward.toFixed(2)} BROCK</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                          UNCLAIMED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wallet Balance & Economy Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} color="var(--accent-primary)" /> Wallet Balance
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{balance}</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', paddingBottom: '4px' }}>$BROCK</span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>Swap</button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>Bridge</button>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Vault size={18} color="#ec4899" /> Protocol Stats
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Circulating Supply</span>
                <span style={{ fontWeight: 600 }}>1,245,000 BROCK</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Max Supply</span>
                <span style={{ fontWeight: 600 }}>21,000,000 BROCK</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current Emission</span>
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>100 BROCK / Round</span>
              </div>
              <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Treasury Holdings</span>
                <span style={{ fontWeight: 600 }}>249,000 BROCK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Economy;
