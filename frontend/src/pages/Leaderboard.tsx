import React from 'react';
import { Trophy, Swords, Zap, Users } from 'lucide-react';

export const Leaderboard = () => {
  // Mock data for leaderboard
  const topMiners = [
    { rank: 1, address: '0x1A2B...3C4D', mp: 12500, sectors: 42, guild: 'The Iron Pickaxes' },
    { rank: 2, address: '0x5E6F...7G8H', mp: 11200, sectors: 38, guild: 'Hashrate Kings' },
    { rank: 3, address: '0x9I0J...1K2L', mp: 10800, sectors: 35, guild: 'Base Cartel' },
    { rank: 4, address: '0x3M4N...5O6P', mp: 9500, sectors: 28, guild: null },
    { rank: 5, address: '0x7Q8R...9S0T', mp: 8900, sectors: 25, guild: 'The Iron Pickaxes' },
    { rank: 6, address: '0x1U2V...3W4X', mp: 8200, sectors: 20, guild: 'Hashrate Kings' },
  ];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
          <Trophy size={32} color="#eab308" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Global Leaderboard</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>The most powerful miners and guilds on Base Sepolia.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Top Miners Table */}
        <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Swords size={20} color="var(--accent-primary)" /> Individual Dominance
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Rank</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Miner Address</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Guild</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total MP</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sectors</th>
                </tr>
              </thead>
              <tbody>
                {topMiners.map((miner) => (
                  <tr key={miner.rank} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: miner.rank <= 3 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }} className="hover:bg-white/5">
                    <td style={{ padding: '16px', fontWeight: miner.rank <= 3 ? 800 : 500, color: miner.rank === 1 ? '#eab308' : miner.rank === 2 ? '#94a3b8' : miner.rank === 3 ? '#b45309' : 'var(--text-primary)' }}>
                      #{miner.rank}
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'var(--font-mono)' }}>{miner.address}</td>
                    <td style={{ padding: '16px' }}>
                      {miner.guild ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <Users size={12} color="var(--accent-tertiary)" /> {miner.guild}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} color="#eab308" /> {miner.mp.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{miner.sectors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Guilds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--accent-tertiary)" /> Top Guilds
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GuildRow rank={1} name="The Iron Pickaxes" mp={32400} />
              <GuildRow rank={2} name="Hashrate Kings" mp={28900} />
              <GuildRow rank={3} name="Base Cartel" mp={19500} />
              <GuildRow rank={4} name="Anon Miners" mp={12000} />
              <GuildRow rank={5} name="Satoshi's Legacy" mp={8500} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuildRow = ({ rank, name, mp }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
    <div style={{ 
      width: '28px', height: '28px', borderRadius: '50%', 
      background: rank === 1 ? '#eab308' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : 'var(--bg-tertiary)',
      color: rank <= 3 ? 'var(--bg-primary)' : 'var(--text-secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.85rem', marginRight: '16px'
    }}>
      {rank}
    </div>
    <div style={{ flex: 1, fontWeight: 600 }}>{name}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
      <Zap size={14} color="#eab308" /> {(mp / 1000).toFixed(1)}k
    </div>
  </div>
);

export default Leaderboard;
