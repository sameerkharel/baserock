import React from 'react';
import { useAccount } from 'wagmi';
import { User, Shield, Hash, Pickaxe, Coins } from 'lucide-react';

// Format address for display
const formatAddress = (addr?: string) => {
  if (!addr) return '0x0000...0000';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const Profile = () => {
  const { address, isConnected } = useAccount();

  // Mock progression data for UI demonstration
  const mockProfile = {
    level: 12,
    title: 'Journeyman Excavator',
    xp: 4500,
    nextLevelXp: 5000,
    totalHashes: '124.5M',
    blocksMined: 3,
    guild: 'The Iron Pickaxes',
    badges: [
      { name: 'FIRST_BLOOD', desc: 'Submitted your first valid proof' },
      { name: 'LAND_GRABBER', desc: 'Claimed 5 grid sectors' },
      { name: 'HASHING_MACHINE', desc: 'Computed 100M hashes' }
    ]
  };

  const progressPercentage = (mockProfile.xp / mockProfile.nextLevelXp) * 100;

  if (!isConnected) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', margin: '0 auto', border: '1px dashed var(--alert-red)' }}>
          <User size={64} color="var(--alert-red)" style={{ marginBottom: '24px' }} />
          <h2 style={{ color: 'var(--alert-red)' }}>ERR_NO_CONNECTION</h2>
          <p style={{ color: 'var(--text-secondary)' }}>&gt; AWAITING_WEB3_PROVIDER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', border: '1px solid var(--hacker-cyan)', background: 'rgba(0, 255, 255, 0.1)' }}>
          <User size={32} color="var(--hacker-cyan)" />
        </div>
        <div>
          <h1 className="glitch-hover" style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>SYS_USER_DATA</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>&gt; ACCESSING_LOCAL_NODE_STATS</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px dashed var(--text-muted)', paddingBottom: '24px', marginBottom: '24px' }}>
            <div style={{ 
              width: '100px', height: '100px', 
              border: '2px solid var(--hacker-cyan)',
              background: 'rgba(0, 255, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
            }}>
              <User size={48} color="var(--hacker-cyan)" />
            </div>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontFamily: 'var(--font-main)' }}>{formatAddress(address)}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '4px 8px', background: 'var(--terminal-green-dim)', border: '1px solid var(--terminal-green)', color: 'var(--terminal-green)', fontSize: '0.85rem', fontWeight: 600 }}>
                  LVL {mockProfile.level}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{mockProfile.title}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>EXP_PROGRESS</span>
              <span style={{ color: 'var(--hacker-cyan)', fontWeight: 600, fontFamily: 'var(--font-main)' }}>{mockProfile.xp} / {mockProfile.nextLevelXp} XP</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progressPercentage}%`, 
                background: 'var(--hacker-cyan)',
                boxShadow: '0 0 10px var(--hacker-cyan)'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <StatBox icon={<Pickaxe size={20} />} label="HASHES_COMPUTED" value={mockProfile.totalHashes} />
            <StatBox icon={<Hash size={20} />} label="PROOFS_FOUND" value={mockProfile.blocksMined} />
            <StatBox icon={<Coins size={20} />} label="BROCK_MINED" value="1,240" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '24px', color: 'var(--hacker-magenta)' }}>&gt; ACHIEVEMENT_BADGES</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {mockProfile.badges.map((badge, index) => (
                <div key={index} style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px dashed var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ minWidth: '40px', height: '40px', border: '1px solid var(--hacker-magenta)', background: 'rgba(255,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hacker-magenta)' }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{badge.name}</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--hacker-cyan)' }}>&gt; GUILD_HUB</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
              Combine your MP with other nodes to conquer high-tier territories.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--hacker-cyan)', color: 'var(--hacker-cyan)' }}>[ MANAGE_GUILD ]</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, value }: any) => (
  <div style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hacker-cyan)', marginBottom: '12px' }}>
      {icon}
      <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-main)' }}>{value}</div>
  </div>
);

export default Profile;
