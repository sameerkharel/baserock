import React from 'react';
import { Trophy, Medal, Zap, Users } from 'lucide-react';

export const Leaderboard = () => {
  // Mock data for top miners
  const topMiners = [
    { rank: 1, address: '0x858E...1C02', mp: 142000, bounty: '14.2k BROCK', sectors: 42, guild: 'SysAdmins', level: 99 },
    { rank: 2, address: '0x1A2B...3C4D', mp: 12500, bounty: '1.25k BROCK', sectors: 12, guild: 'The Iron Pickaxes', level: 85 },
    { rank: 3, address: '0x5E6F...7G8H', mp: 11200, bounty: '1.12k BROCK', sectors: 8, guild: 'Hashrate Kings', level: 72 },
    { rank: 4, address: '0x9I0J...1K2L', mp: 10800, bounty: '1.08k BROCK', sectors: 6, guild: 'Base Cartel', level: 68 },
    { rank: 5, address: '0x3M4N...5O6P', mp: 9500, bounty: '950 BROCK', sectors: 2, guild: null, level: 55 },
    { rank: 6, address: '0x7Q8R...9S0T', mp: 8900, bounty: '890 BROCK', sectors: 2, guild: 'The Iron Pickaxes', level: 52 },
  ];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', border: '1px solid var(--alert-red)', background: 'rgba(255, 0, 60, 0.1)' }}>
          <Trophy size={32} color="var(--alert-red)" />
        </div>
        <div>
          <h1 className="glitch-hover" style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>SYS_RANKINGS</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>&gt; TOP_MINERS_BY_MP</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed var(--text-muted)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '24px 16px' }}>RANK</th>
                <th style={{ padding: '24px 16px' }}>ADDRESS</th>
                <th style={{ padding: '24px 16px' }}>GUILD</th>
                <th style={{ padding: '24px 16px', textAlign: 'right' }}>BOUNTY</th>
                <th style={{ padding: '24px 16px', textAlign: 'right' }}>MINING_POWER</th>
              </tr>
            </thead>
            <tbody>
              {topMiners.map((miner, index) => (
                <tr key={miner.address} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: index === 0 ? 'rgba(255, 0, 60, 0.05)' : index === 1 ? 'rgba(0, 255, 255, 0.05)' : 'transparent'
                }}>
                  <td style={{ padding: '24px 16px', fontWeight: 600, color: index === 0 ? 'var(--alert-red)' : index === 1 ? 'var(--hacker-cyan)' : 'var(--text-secondary)' }}>
                    {index === 0 ? <Medal size={20} /> : `[${miner.rank}]`}
                  </td>
                  <td style={{ padding: '24px 16px', fontFamily: 'var(--font-main)' }}>{miner.address}</td>
                  <td style={{ padding: '24px 16px', color: 'var(--terminal-green)' }}>{miner.guild || '[NONE]'}</td>
                  <td style={{ padding: '24px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--alert-red)' }}>{miner.bounty}</td>
                  <td style={{ padding: '24px 16px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-main)', color: 'var(--text-primary)' }}>
                    {miner.mp.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MP</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
