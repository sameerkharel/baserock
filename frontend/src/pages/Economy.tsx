import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { miningEngineABI, rewardDistributorABI } from '../config/abi';
import { Terminal, Coins, ArrowUpRight, Shield, ShieldAlert, BarChart3, Clock, HandCoins, Wallet, Vault } from 'lucide-react';
import { formatEther, formatUnits } from 'viem';

// Replace with deployed addresses on Base Sepolia
const REWARD_DISTRIBUTOR_ADDRESS = '0x0000000000000000000000000000000000000000';
const BROCK_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

export const Economy = () => {
  const { address, isConnected } = useAccount();
  
  // Mock data for display
  const mockClaimableRounds = [
    { id: 12, mp: 5, totalProofs: 100, isClaimed: false },
    { id: 13, mp: 8, totalProofs: 120, isClaimed: false },
    { id: 14, mp: 12, totalProofs: 90, isClaimed: false },
  ];
  
  const totalClaimableBROCK = mockClaimableRounds.reduce((acc, round) => {
    return acc + (80 * round.mp) / round.totalProofs;
  }, 0);

  const claimableData = BigInt(Math.floor(totalClaimableBROCK * 1e18));
  const formatBalance = (val: bigint) => Number(formatEther(val)).toFixed(2);
  const lastDistributionTime = "12:45:00 UTC";

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

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
        <div style={{ padding: '12px', border: '1px solid var(--hacker-magenta)', background: 'rgba(255,0,255,0.1)' }}>
          <Terminal size={32} color="var(--hacker-magenta)" />
        </div>
        <div>
          <h1 className="glitch-hover" style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>SYS_TREASURY</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>&gt; ACCESSING_PROTOCOL_FUNDS</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
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
              onClick={() => writeContract({
                address: REWARD_DISTRIBUTOR_ADDRESS,
                abi: rewardDistributorABI,
                functionName: 'claimRewards'
              })}
              disabled={isPending || isConfirming || totalClaimableBROCK === 0}
              style={{ background: 'var(--hacker-magenta)', borderColor: 'var(--hacker-magenta)', color: '#000' }}
            >
              <ArrowUpRight size={18} /> [ EXECUTE_CLAIM ]
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
                        <span style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>UNCLAIMED</span>
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
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--text-muted)', paddingBottom: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--hacker-magenta)' }}>&gt; UNCLAIMED_FUNDS</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>PENDING $BROCK ALLOCATION</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-main)' }}>
                  {formatBalance(claimableData)}
                </span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>BROCK</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>Swap</button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>Bridge</button>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '24px', color: 'var(--terminal-green)' }}>&gt; REWARD_SCHEDULER</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={20} color="var(--hacker-cyan)" />
                  <span style={{ color: 'var(--text-secondary)' }}>LAST_DISTRIBUTION</span>
                </div>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-main)' }}>{lastDistributionTime}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BarChart3 size={20} color="var(--terminal-green)" />
                  <span style={{ color: 'var(--text-secondary)' }}>EMISSION_RATE</span>
                </div>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-main)' }}>~10,000 BROCK / DAY</span>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--hacker-cyan)' }}>&gt; SMART_CONTRACTS</h3>
              <ContractStatus name="MINING_ENGINE" address={REWARD_DISTRIBUTOR_ADDRESS} active={true} />
              <ContractStatus name="TREASURY" address="0x..." active={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Economy;
